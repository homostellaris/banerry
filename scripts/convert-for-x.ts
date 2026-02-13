import { $ } from 'bun'

const input = process.argv[2]
if (!input) {
	console.error('Usage: bun scripts/convert-for-x.ts <input.mp4>')
	process.exit(1)
}

const output = input.replace(/\.mp4$/, ' - x.mp4')

await $`ffmpeg -i ${input} \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -vf scale=1920:1080 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  ${output}`

console.log(`\nOutput: ${output}`)
