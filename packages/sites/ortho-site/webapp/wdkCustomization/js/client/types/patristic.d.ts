declare module 'patristic' {
  export class Branch {
    id: string;
    parent?: Branch | null;
    length?: number;
    children?: Branch[];
    value?: number;
    depth?: number;
    height?: number;

    constructor(data: Branch, children?: (data: any) => Branch[]);
    addChild(data: Branch): Branch;
    addParent(data: Branch, siblings?: Branch[]): Branch;
    ancestors(): Branch[];
    clone(): Branch;
    getLeaves(): Branch[];
  }

  export function parseNewick(newickStr: string): Branch;
}
