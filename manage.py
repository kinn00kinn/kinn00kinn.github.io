import os
import json
from datetime import datetime
from PIL import Image
import shutil
import argparse

# --- Configuration ---
IMAGES_DIR = 'images'
COMPRESSED_DIR = 'images_compressed'
BLOGS_JSON_PATH = 'blogs.json'
MD_DIR = os.path.join('blog', 'md')
COMPRESSION_QUALITY = 40

# --- Functions ---

def migrate_gallery_add_original_src():
    """
    Updates existing gallery.json entries to include the 'original_src' field.
    """
    print("\nMigrating gallery.json to add 'original_src'...")
    try:
        with open("gallery.json", 'r', encoding='utf-8') as f:
            gallery_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print("gallery.json not found or is invalid.")
        return

    updated_count = 0
    for item in gallery_data:
        if 'original_src' not in item or not item['original_src']:
            compressed_filename = os.path.basename(item['src'])
            base_name = os.path.splitext(compressed_filename)[0]
            
            original_filename = None
            # Search for the original file with various extensions
            for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG']:
                potential_original = base_name + ext
                if os.path.exists(os.path.join(IMAGES_DIR, potential_original)):
                    original_filename = potential_original
                    break
            
            if original_filename:
                item['original_src'] = os.path.join(IMAGES_DIR, original_filename).replace('\\', '/')
                updated_count += 1
                print(f"Updated {compressed_filename} with original_src: {item['original_src']}")
            else:
                print(f"Could not find original image for {compressed_filename}, skipping.")

    if updated_count > 0:
        with open("gallery.json", 'w', encoding='utf-8') as f:
            json.dump(gallery_data, f, indent=2, ensure_ascii=False)
        print(f"\nSuccessfully migrated {updated_count} entries in gallery.json.")
    else:
        print("No entries needed migration.")


def update_gallery():
    """
    Scans the compressed images directory and adds any new images to the gallery.json file.
    """
    print("\nUpdating gallery.json...")
    if not os.path.exists(BLOGS_JSON_PATH):
        print(f"Error: {BLOGS_JSON_PATH} not found.")
        return

    try:
        with open("gallery.json", 'r', encoding='utf-8') as f:
            gallery_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        gallery_data = []

    existing_files = {os.path.basename(item['src']) for item in gallery_data}
    new_images_added = 0

    if not os.path.exists(COMPRESSED_DIR):
        print(f"Compressed directory '{COMPRESSED_DIR}' not found. Nothing to update.")
        return

    for filename in os.listdir(COMPRESSED_DIR):
        if filename not in existing_files:
            original_filename_found = None
            for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG']:
                potential_original = os.path.splitext(filename)[0] + ext
                if os.path.exists(os.path.join(IMAGES_DIR, potential_original)):
                    original_filename_found = potential_original
                    break
            
            if original_filename_found is None:
                print(f"Could not find original image for {filename}, skipping.")
                continue

            new_entry = {
                "src": f"images_compressed/{filename}",
                "original_src": f"images/{original_filename_found}",
                "title": os.path.splitext(filename)[0], # Use filename as title
                "category": "new" # Default category
            }
            gallery_data.insert(0, new_entry) # Add to the top
            print(f"Added new image to gallery: {filename}")
            new_images_added += 1

    if new_images_added > 0:
        with open("gallery.json", 'w', encoding='utf-8') as f:
            json.dump(gallery_data, f, indent=2, ensure_ascii=False)
        print(f"\nSuccessfully added {new_images_added} new images to gallery.json.")
        print("Please review gallery.json to update titles and categories.")
    else:
        print("No new images found to add to the gallery.")

def compress_images():
    """
    Compresses images from the source directory and saves them to the destination directory.
    """
    if not os.path.exists(COMPRESSED_DIR):
        os.makedirs(COMPRESSED_DIR)
        print(f"Created directory: {COMPRESSED_DIR}")

    print(f"Starting image compression...")
    compressed_count = 0
    for filename in os.listdir(IMAGES_DIR):
        source_path = os.path.join(IMAGES_DIR, filename)
        dest_path = os.path.join(COMPRESSED_DIR, os.path.splitext(filename)[0] + '.webp')

        if not os.path.isfile(source_path):
            continue
        
        if os.path.exists(dest_path):
            continue

        try:
            with Image.open(source_path) as img:
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                img.save(dest_path, 'webp', quality=COMPRESSION_QUALITY, exif=b'')
                print(f"Compressed and saved (EXIF stripped): {dest_path}")
                compressed_count += 1
        except Exception as e:
            print(f"Could not compress {filename}: {e}")
    
    if compressed_count == 0:
        print("No new images to compress.")
    else:
        print(f"\nImage compression complete. Compressed {compressed_count} new images.")
    
    update_gallery()


def add_blog_post(md_file_path, title, description):
    """
    Adds a new blog post entry to blogs.json and moves the markdown file.
    """
    if not os.path.exists(md_file_path):
        print(f"Error: Markdown file not found at '{md_file_path}'")
        return

    with open(BLOGS_JSON_PATH, 'r', encoding='utf-8') as f:
        blogs = json.load(f)

    new_id = f"post{len(blogs) + 1}"
    md_filename = os.path.basename(md_file_path)
    new_md_path = os.path.join(MD_DIR, md_filename)
    
    if any(post['mdFile'] == md_filename for post in blogs):
        print(f"Error: A blog post with the markdown file '{md_filename}' already exists.")
        return

    new_post = {
        "id": new_id,
        "title": title,
        "date": datetime.now().strftime('%Y年%m月%d日'),
        "desc": description,
        "mdFile": md_filename
    }

    blogs.insert(0, new_post)
    with open(BLOGS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, indent=4, ensure_ascii=False)

    if not os.path.exists(MD_DIR):
        os.makedirs(MD_DIR)
    shutil.move(md_file_path, new_md_path)

    print("\nSuccessfully added new blog post!")
    print(f"  ID: {new_id}")
    print(f"  Title: {title}")
    print(f"  Markdown: {new_md_path}")


def main():
    """
    Main function to parse command-line arguments.
    """
    parser = argparse.ArgumentParser(description="Manage your blog and images.")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    parser_compress = subparsers.add_parser('compress', help='Compress all images and update the gallery.')
    parser_update = subparsers.add_parser('update', help='Update gallery.json with new images found in the compressed folder.')
    
    parser_addpost = subparsers.add_parser('addpost', help='Add a new blog post.')
    parser_addpost.add_argument('mdfile', type=str, help='Path to the new markdown file.')
    parser_addpost.add_argument('title', type=str, help='The title of the blog post.')
    parser_addpost.add_argument('description', type=str, help='A short description of the post.')

    parser_migrate = subparsers.add_parser('migrate', help='Migrate gallery.json to add original_src fields.')

    args = parser.parse_args()

    if args.command == 'compress':
        compress_images()
    elif args.command == 'update':
        update_gallery()
    elif args.command == 'addpost':
        add_blog_post(args.mdfile, args.title, args.description)
    elif args.command == 'migrate':
        migrate_gallery_add_original_src()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()