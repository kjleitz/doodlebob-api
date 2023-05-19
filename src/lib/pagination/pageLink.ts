export default function pageLink(url: string, pageIndex: number, pageSize: number): string {
  return `${url}?page[index]=${pageIndex}&page[size]=${pageSize}`;
}
