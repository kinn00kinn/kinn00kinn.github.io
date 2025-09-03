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
COMPRESSION_QUALITY = 85

# --- Functions ---

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
        dest_path = os.path.join(COMPRESSED_DIR, filename.split('.')[0] + '.webp')

        # Skip non-file items
        if not os.path.isfile(source_path):
            continue
        
        # Skip if compressed version already exists
        if os.path.exists(dest_path):
            continue

        try:
            with Image.open(source_path) as img:
                # EXIF情報を保持せずにRGBに変換
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # EXIFデータを引き継がずに保存
                img.save(dest_path, 'webp', quality=COMPRESSION_QUALITY, exif=b'')
                print(f"Compressed and saved (EXIF stripped): {dest_path}")
                compressed_count += 1
        except Exception as e:
            print(f"Could not compress {filename}: {e}")
    
    if compressed_count == 0:
        print("No new images to compress.")
    else:
        print(f"\nImage compression complete. Compressed {compressed_count} new images.")


def add_blog_post(md_file_path, title, description):
    """
    Adds a new blog post entry to blogs.json and moves the markdown file.
    """
    if not os.path.exists(md_file_path):
        print(f"Error: Markdown file not found at '{md_file_path}'")
        return

    # Load existing blog data
    with open(BLOGS_JSON_PATH, 'r', encoding='utf-8') as f:
        blogs = json.load(f)

    # Generate new post details
    new_id = f"post{len(blogs) + 1}"
    md_filename = os.path.basename(md_file_path)
    new_md_path = os.path.join(MD_DIR, md_filename)
    
    # Check for duplicate md file
    if any(post['mdFile'] == md_filename for post in blogs):
        print(f"Error: A blog post with the markdown file '{md_filename}' already exists.")
        return

    # Create new post object
    new_post = {
        "id": new_id,
        "title": title,
        "date": datetime.now().strftime('%Y年%m月%d日'), # YYYY年MM月DD日 format
        "desc": description,
        "mdFile": md_filename
    }

    # Add to list and save
    blogs.insert(0, new_post) # Add to the beginning of the list
    with open(BLOGS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, indent=4, ensure_ascii=False)

    # Move the markdown file
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

    # 'compress' command
    parser_compress = subparsers.add_parser('compress', help='Compress all images in the images/ directory.')
    
    # 'addpost' command
    parser_addpost = subparsers.add_parser('addpost', help='Add a new blog post.')
    parser_addpost.add_argument('mdfile', type=str, help='Path to the new markdown file.')
    parser_addpost.add_argument('title', type=str, help='The title of the blog post.')
    parser_addpost.add_argument('description', type=str, help='A short description of the post.')

    args = parser.parse_args()

    if args.command == 'compress':
        compress_images()
    elif args.command == 'addpost':
        add_blog_post(args.mdfile, args.title, args.description)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
