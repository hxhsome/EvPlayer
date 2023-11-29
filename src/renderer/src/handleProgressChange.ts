export const handleProgressChange = (value): void => {
console.log('handleProgressChange:', value);
const recording = recording.value;
if (recording) {
// Request seek
recording.seek(value, () => {
console.log('complete');
});
}
};
