export function timeToNum(time: string | undefined): number {
  if (!time) return 0;
  const timeDefinition = time.split('')[time.split('').length - 1];

  switch (timeDefinition) {
    case 'd':
      return Number(time.split('d')[0]) * 86400;
    case 'h':
      return Number(time.split('h')[0]) * 3600;
    case 'm':
      return Number(time.split('m')[0]) * 60;
    case 's':
      return Number(time.split('s')[0]);
    default:
      return 0;
  }
}
