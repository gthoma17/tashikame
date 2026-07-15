export function prTitle(commitSubject) {
  return (commitSubject || "").trim();
}
if (process.argv[2] !== undefined) process.stdout.write(prTitle(process.argv[2]));
