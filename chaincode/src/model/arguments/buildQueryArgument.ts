export class buildQueryArgument {
    public documentType: string;
    public queryArgs: string[];
    public sort?: string[] = [];
    public index?: string[] = [];
    public limit?: number = -1;
}
