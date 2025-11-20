#!/bin/bash

# Download Figma images locally
echo "🖼️  Downloading Figma images..."

IMAGES_DIR="./public/images"

# Array of image URLs and their filenames
declare -a URLS=(
  "https://www.figma.com/api/mcp/asset/290490a2-5396-4f24-97ea-74c38365d0e9:default-image.png"
  "https://www.figma.com/api/mcp/asset/fe3aad0c-1c04-41cd-9ffa-725ef1c483b6:image-1.png"
  "https://www.figma.com/api/mcp/asset/1ede7ea0-7e0c-4915-bb90-bb9a4bcc49e5:map-image.png"
  "https://www.figma.com/api/mcp/asset/91636383-9b42-436d-b2c8-f460e654377a:vector.png"
  "https://www.figma.com/api/mcp/asset/21456f3d-7309-4435-9d98-85b64264d593:vector-1.png"
  "https://www.figma.com/api/mcp/asset/17325962-5fde-4cd0-873b-d78ea088b73c:vector-2.png"
  "https://www.figma.com/api/mcp/asset/7c5e6a34-4138-455f-9811-3cef886a43fc:vector-3.png"
  "https://www.figma.com/api/mcp/asset/15a8cdde-bd45-46bd-9a6a-4a443c719b15:ellipse-1.png"
  "https://www.figma.com/api/mcp/asset/8d737b67-199c-42be-9d1c-4dc5c43b079b:ellipse-2.png"
  "https://www.figma.com/api/mcp/asset/cc8fe8de-31f7-43fb-ad11-87265528d4d2:ellipse-8.png"
  "https://www.figma.com/api/mcp/asset/03550ac2-1210-439a-bf0d-b82a96307284:ellipse-7.png"
  "https://www.figma.com/api/mcp/asset/051eac42-6e3d-4589-a0fe-14a92c291351:ellipse-3.png"
  "https://www.figma.com/api/mcp/asset/d921f7b1-3642-4aa1-a761-1202cc99ce83:ellipse-5.png"
  "https://www.figma.com/api/mcp/asset/8fce0ca8-dfee-4c9c-8d83-84f036f80e1d:ellipse-6.png"
  "https://www.figma.com/api/mcp/asset/048c86ff-e79d-4483-8859-702d8db23cdb:icon.png"
  "https://www.figma.com/api/mcp/asset/d06002c0-215c-4ee9-8f0f-676445a616fc:icon-1.png"
  "https://www.figma.com/api/mcp/asset/4f6da687-3b39-4f18-b901-674f8b56eb8f:icon-2.png"
  "https://www.figma.com/api/mcp/asset/6e8aa37e-5765-43ab-8729-7774f326405a:icon-3.png"
  "https://www.figma.com/api/mcp/asset/671bcbbd-ed89-4e21-8c04-0f17add86636:icon-4.png"
)

# Download each image
for url_pair in "${URLS[@]}"; do
  url="${url_pair%:*}"
  filename="${url_pair##*:}"
  
  echo "Downloading: $filename"
  curl -s -o "$IMAGES_DIR/$filename" "$url" || echo "Failed to download: $filename"
done

echo "✅ Download complete!"
echo "Images saved to: $IMAGES_DIR"
