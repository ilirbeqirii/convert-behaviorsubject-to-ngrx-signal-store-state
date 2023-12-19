import { CanActivateFn, Routes } from '@angular/router';
import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspacesStore } from './state/workspace.store';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

const canActivateWorkspaceFn: CanActivateFn = (route, state) => {
  const store = inject(WorkspacesStore);
  const { workspaceGuid } = route.params;

  return store.canActivateWorkspace(workspaceGuid).pipe(
    tap((canActivate) => {
      if (canActivate) {
        if (workspaceGuid !== store.selectedWorkspaceId()) {
          store.changeSelectedWorkspace(workspaceGuid);
        }

        return true;
      } else {
        store.changeSelectedWorkspace(store.workspaces()[0]?.guid);
        // router.navigate(['/', 'main']);

        return true; //false;
      }
    })
  );
};

export const routes: Routes = [
  {
    path: 'workspace',
    component: WorkspaceComponent,
    canActivate: [canActivateWorkspaceFn],
  },
  {
    path: '',
    redirectTo: 'workspace',
    pathMatch: 'full',
  },
];
