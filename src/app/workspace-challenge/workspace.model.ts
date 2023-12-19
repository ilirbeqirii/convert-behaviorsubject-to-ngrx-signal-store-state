export class Workspace {
  id: number | null = null;
  guid: string = '';
  name: string = '';
  status: boolean = true;
  description: string = '';
  timezone: string = '';
}

export const workspaces: Workspace[] = [
  {
    id: 1,
    guid: 'abc123',
    name: 'Workspace 1',
    status: true,
    description: 'This is the first workspace',
    timezone: 'UTC+0',
  },
  {
    id: 2,
    guid: 'def456',
    name: 'Workspace 2',
    status: false,
    description: 'This is the second workspace',
    timezone: 'UTC-5',
  },
  {
    id: 3,
    guid: 'abwc123',
    name: 'Workspace 1',
    status: true,
    description: 'This is the second workspace',
    timezone: 'UTC+0',
  },
];
