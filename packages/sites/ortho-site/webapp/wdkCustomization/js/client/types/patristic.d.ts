declare module 'patristic' {
  interface BranchData {
    id: string;
    parent?: Branch | null;
    length?: number;
    children?: Branch[];
    value?: number;
    depth?: number;
    height?: number;
  }

  export class Branch {
    constructor(data: BranchData, children?: (data: any) => Branch[]);
    addChild(data: Branch | BranchData): Branch;
    addParent(data: Branch | BranchData, siblings?: Branch[]): Branch;
    ancestors(): Branch[];
    clone(): Branch;
    getLeaves(): Branch[];
  }

  export function parseNewick(newickStr: string): Branch;
}
