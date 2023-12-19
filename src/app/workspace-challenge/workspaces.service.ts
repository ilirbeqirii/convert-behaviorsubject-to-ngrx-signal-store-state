import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  firstValueFrom,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import { CRUDService } from './crud.service';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { environment as env } from '../../environments/environment';
import { StateService } from './state.service';
import { PopupDialogService } from './popup-dialog.service';
import { TableActionsService } from './table-actions.service';
import { TableName } from './table-name.enum';
import { Workspace } from './workspace.model';
import { getFromLocalStorage, setToLocalStorage } from './helpers';

export const CURRENT_WORKSPACE_STATE_KEY = 'currentWorkspace';

const i18n = (code: string) => code;

@Injectable({
  providedIn: 'root',
})
export class WorkspacesService {
  private readonly crudService = inject(CRUDService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly state = inject(StateService);
  private readonly dialogService = inject(PopupDialogService);
  private readonly tableActionsService = inject(TableActionsService);

  /**
   * @Deprecated
   *
   * */
  private _workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject<
    Workspace[]
  >([]);

   /**
   * @Deprecated
   *
   * */
  workspaces$: Observable<Workspace[]> = this._workspaces.pipe(
    shareReplay(1),
    distinctUntilChanged(),
    tap(() => this.setDefaultWorkspaceIfNoOneIsSelected())
  );

  /**
   * @Deprecated
   *
   * */
  private _selectedWorkspace = new BehaviorSubject<Workspace | null>(
    getFromLocalStorage(CURRENT_WORKSPACE_STATE_KEY)
  );

  /**
   * @Deprecated
   *
   * */
  selectedWorkspace$: Observable<Workspace | null> =
    this._selectedWorkspace.pipe(
      shareReplay(1),
      distinctUntilChanged(),
      tap((payload) => {
        if (payload) setToLocalStorage(CURRENT_WORKSPACE_STATE_KEY, payload);
      }),
      
      
      
      // this can be done outside the store
      tap((payload) => this.crudService.setWorkspaceEndpoints(payload?.guid))
    );

  /**
   * @Deprecated
   *
   * */
  constructor() {
    // clear state
    this.state.clearAppState$.subscribe(() => {
      this._selectedWorkspace.next(null);
      localStorage.removeItem(CURRENT_WORKSPACE_STATE_KEY);
      this._workspaces.next([]);
    });
  }

  /**
   * @Deprecated
   *
   * */
  getSelectedWorkspaceSnap = (): Workspace | null =>
    this._selectedWorkspace.value;

  /**
   * @Deprecated
   *
   * */
  getWorkspacesSnap = (): Workspace[] => this._workspaces.value;

  /**
   * @Deprecated
   *
   * */
  fetchAllWorkspaces(): Observable<Workspace[]> {
    if (!this.authenticationService.getAuthInfoSnap().accessToken)
      return of([]);
    return (
      this.crudService.getAll(Workspace).pipe(
        map(
          (workspaces) =>
            workspaces?.filter((workspace) => workspace.status) || []
        ),
        tap((workspaces) => this._workspaces.next(workspaces)),
        tap(() => this.setDefaultWorkspaceIfNoOneIsSelected())
      ) || of([])
    );
  }

  /**
   * @Deprecated
   *
   * */
  changeSelectedWorkspace(workspaceGuid?: string | undefined | null) {
    if (
      !workspaceGuid ||
      this.getSelectedWorkspaceSnap()?.guid === workspaceGuid
    ) {
      this._selectedWorkspace.next(null);
      return;
    }
    const matchedWorkspace = this.findWorkspaceByGuid(workspaceGuid);
    if (matchedWorkspace) {
      this._selectedWorkspace.next(matchedWorkspace);
    }
  }

  /**
   * @Deprecated
   *
   * */
  async canActivateWorkspace(
    workspaceGuidUrlVariable: string
  ): Promise<boolean> {
    let workspaces = this.getWorkspacesSnap();
    if (workspaces.length === 0)
      workspaces = await firstValueFrom(this.fetchAllWorkspaces());

    if (
      !workspaces.some(
        (workspace) => workspace.guid === workspaceGuidUrlVariable
      )
    ) {
      this.changeSelectedWorkspace(workspaces[0]?.guid);
      // this can be done outside the store
      this.router.navigate(['/', 'main']);
      return false;
    } else {
      const selectedWorkspaceGuid = this.getSelectedWorkspaceSnap()?.guid;
      if (selectedWorkspaceGuid !== workspaceGuidUrlVariable)
        this.changeSelectedWorkspace(workspaceGuidUrlVariable);
      return true;
    }
  }
  /**
   * @Deprecated
   *
   * */
  setDefaultWorkspaceIfNoOneIsSelected() {
    const workspaces = this.getWorkspacesSnap();
    const currentGuid = this.getSelectedWorkspaceSnap()?.guid;

    const setFirstWorkspace = () =>
      this.changeSelectedWorkspace(
        workspaces.length > 0 ? workspaces[0]?.guid : null
      );
    if (!currentGuid) {
      setFirstWorkspace();
    } else {
      // if current workspace isn't exist anymore
      if (!workspaces.some((w) => w.guid === currentGuid)) {
        setFirstWorkspace();
      }
    }
  }

  /**
   * @Deprecated
   *
   * */
  // this can be done outside the store
  handleNewWorkspaceRouting(
    newWorkspace: Workspace | null,
    workspaceIdUrlParam?: string
  ) {
    if (workspaceIdUrlParam === newWorkspace?.guid) return;
    this.router.navigateByUrl(`/main/${newWorkspace?.guid}/${env.basePath}`);
  }

  /**
   * @Deprecated
   *
   * */
  deleteWorkspace = async (guid: string, name: string) => {
    // this can be done outside the store
    const deleteConfirmed = await firstValueFrom(
      this.dialogService.openCriticalDeleteConfirmDialog(
        i18n('common.label.workspace'),
        name,
        i18n('administration.dialog.deletion.message')
      )
    );
    if (deleteConfirmed) {
      await firstValueFrom(this.crudService.delete(Workspace, guid));
      this.tableActionsService.triggerUpdate(TableName.Workspaces);
    }
    return deleteConfirmed;
  };

  /**
   * @Deprecated
   *
   * */
  private findWorkspaceByGuid = (
    workspaceGuid: string | null
  ): Workspace | undefined =>
    this.getWorkspacesSnap().find(
      (workspace) => workspace.guid === workspaceGuid
    );
}
