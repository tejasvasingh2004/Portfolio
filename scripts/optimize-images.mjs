// Converts raw uploads in /intake into optimized web assets in /public.
// Run: node scripts/optimize-images.mjs
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";

const jobs = [
  {
    src: "intake/profile/tejasva2.jpg",
    out: "public/assets/profile/tejasva",
    // Square head-and-shoulders crop from the 1200×1200 original.
    extract: { left: 230, top: 150, width: 600, height: 600 },
    size: 640,
  },
  { src: "intake/experience/images.png", out: "public/assets/logos/indhanpay", size: 256 },
];

for (const job of jobs) {
  let img = sharp(job.src);
  if (job.extract) img = img.extract(job.extract);
  img = img.resize(job.size, job.size, { fit: "cover" });
  await img.clone().webp({ quality: 82 }).toFile(`${job.out}.webp`);
  await img.clone().avif({ quality: 60 }).toFile(`${job.out}.avif`);
  console.log("✓", job.out);
}

await mkdir("public/resume", { recursive: true });
await copyFile("intake/profile/tejasva_resume (3).pdf", "public/resume/Tejasva_Singh_Chouhan_Resume.pdf");
console.log("✓ resume");
