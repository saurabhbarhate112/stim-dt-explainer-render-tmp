import sys, glob
from PIL import Image, ImageDraw
files = sorted(glob.glob("out/f*.jpg"))
cols = 2
W, H = 640, 360
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (W * cols, H * rows), "black")
for i, f in enumerate(files):
    im = Image.open(f).resize((W, H))
    sheet.paste(im, ((i % cols) * W, (i // cols) * H))
    d = ImageDraw.Draw(sheet)
    d.rectangle([(i % cols) * W, (i // cols) * H, (i % cols) * W + 60, (i // cols) * H + 14], fill="black")
    d.text(((i % cols) * W + 3, (i // cols) * H + 2), f[5:10], fill="yellow")
sheet.save(sys.argv[1] if len(sys.argv) > 1 else "out/sheet.jpg", quality=82)
