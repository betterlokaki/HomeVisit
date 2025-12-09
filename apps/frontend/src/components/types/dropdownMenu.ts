export interface DropdownMenuItem {
  title: string;
  icon: string; // SVG markup as string
  action: () => void;
}
