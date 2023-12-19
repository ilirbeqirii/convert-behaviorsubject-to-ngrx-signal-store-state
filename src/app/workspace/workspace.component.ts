import { Component, OnInit, inject } from '@angular/core';
import { WorkspacesStore } from '../state/workspace.store';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, tap } from 'rxjs';
import { Workspace } from '../workspace-challenge/workspace.model';
import { environment as env } from '../../environments/environment';
import { i18n } from '../workspace-challenge/helpers';
import { PopupDialogService } from '../workspace-challenge/popup-dialog.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  template: `
    <h3>Welcome to workspace!</h3>

    <p>Workspaces: {{ workspaces().length }}</p>

    <ul>
      @for (workspace of workspaces(); track workspace.id) {
      <li
        [class.active]="selectedWorkspace()?.guid == workspace.guid"
        style="margin: 1rem;"
      >
        {{ workspace.name }} : {{ workspace.description }} :
        {{ workspace.guid }}
        <button (click)="selectWorkspace(workspace.guid)">
          {{
            selectedWorkspaceId() === workspace.guid ? 'Unselect' : 'Select'
          }}</button
        >&nbsp;
        <button (click)="deleteWorkspace(workspace.guid, workspace.name)">
          Delete
        </button>
      </li>
      }
    </ul>
  `,
  styles: `
    .active {
      color: red;
    }
  `,
})
export class WorkspaceComponent {
  readonly store = inject(WorkspacesStore);
  readonly router = inject(Router);
  readonly dialogService = inject(PopupDialogService);

  // state selectors
  workspaces = this.store.workspaces;
  selectedWorkspaceId = this.store.selectedWorkspaceId;
  selectedWorkspace = this.store.selectedWorkspace;

  // state methods
  removeWorkspace = this.store.removeWorkspace;
  changeSelectedWorkspace = this.store.changeSelectedWorkspace;

  handleNewWorkspaceRouting(
    newWorkspace: Workspace | null,
    workspaceIdUrlParam?: string
  ) {
    if (workspaceIdUrlParam === newWorkspace?.guid) {
      return;
    }

    this.router.navigateByUrl(`/main/${newWorkspace?.guid}/${env.basePath}`);
  }

  async deleteWorkspace(guid: string, name: string) {
    const deleteConfirmed = await firstValueFrom(
      this.dialogService.openCriticalDeleteConfirmDialog(
        i18n('common.label.workspace'),
        name,
        i18n('administration.dialog.deletion.message')
      )
    );

    if (deleteConfirmed) {
      this.removeWorkspace(guid);
    }
  }

  selectWorkspace(guid: string) {
    this.changeSelectedWorkspace(guid);
  }
}
