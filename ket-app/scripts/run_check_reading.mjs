import { rolldown } from 'rolldown';

const bundle = await rolldown({ input: 'src/data/check_reading.mts' });
const { output } = await bundle.generate({ format: 'esm', platform: 'node' });
const code = output[0].code;
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
await import(dataUrl);
console.log('CHECK SCRIPT FINISHED');
