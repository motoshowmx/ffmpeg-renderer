const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const upload = multer({ dest: "/tmp/uploads" });

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/render-reel", upload.array("images", 7), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images received" });
    }

    const id = uuidv4();
    const listFile = `/tmp/list-${id}.txt`;
    const output = `/tmp/reel-${id}.mp4`;

    const content = req.files
      .map(f => `file '${f.path}'\nduration 1.5`)
      .join("\n");

    fs.writeFileSync(listFile, content);

    const cmd = `
      ffmpeg -y -f concat -safe 0 -i ${listFile} \
      -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
      -r 30 -pix_fmt yuv420p -c:v libx264 ${output}
    `;

    exec(cmd, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "FFmpeg failed" });
      }
      res.sendFile(output);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unexpected error" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FFmpeg renderer running on ${PORT}`);
});