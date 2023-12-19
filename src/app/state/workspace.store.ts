import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Workspace } from '../workspace-challenge/workspace.model';
import { computed, effect, inject } from '@angular/core';
import { AuthenticationService } from '../workspace-challenge/authentication.service';
import { CRUDService } from '../workspace-challenge/crud.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, exhaustMap, filter, map, mergeMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { StateService } from '../workspace-challenge/state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { TableActionsService } from '../workspace-challenge/table-actions.service';
import { TableName } from '../workspace-challenge/table-name.enum';
import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from './call-state.feature';

export const CURRENT_WORKSPACE_STATE_KEY: string = 'currentWorkspace';

type State = {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
};

export const initialState: State = {
  workspaces: [],
  selectedWorkspaceId:
    localStorage.getItem(CURRENT_WORKSPACE_STATE_KEY) ?? null, // as a base state
};

export const WorkspacesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ workspaces, selectedWorkspaceId, ...store }) => ({
    selectedWorkspace: computed(() =>
      // selected workspace as derived state
      findWorkspace(workspaces(), selectedWorkspaceId())
    ),
  })),
  withCallState(),
  withMethods(({ workspaces, selectedWorkspaceId, callState, ...store }) => {
    const authService = inject(AuthenticationService);
    const crudService = inject(CRUDService);
    const tableActionsService = inject(TableActionsService);

    // saving workspaceId because selectedWorkspace is derived state now
    function changeSelectedWorkspace(guid: string | undefined | null) {
      patchState(store, setSelectedWorkspaceId(guid));
    }

    const removeWorkspace = rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading())),
        mergeMap((guid) =>
          crudService.delete(Workspace, guid).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  setWorkspaces(
                    workspaces().filter((workspace) => workspace.guid != guid)
                  ),
                  setLoaded()
                );
                tableActionsService.triggerUpdate(TableName.Workspaces);
              },
              error: (error: Error) =>
                patchState(store, setError(error.message)),
            })
          )
        )
      )
    );

    const loadAllWorkspaces = rxMethod<void>(
      pipe(
        filter(() => !authService.getAuthInfoSnap().accessToken),
        tap(() => patchState(store, setLoading())),
        exhaustMap(() =>
          crudService.getAll(Workspace).pipe(
            map(
              (workspaces) =>
                workspaces?.filter((workspace) => workspace.status) ?? []
            ),
            tapResponse({
              next: (workspaces) => {
                patchState(
                  store,
                  setWorkspaces(workspaces),
                  setLoaded(),
                  setDefaultSelectedId()
                );
              },
              error: (error: Error) =>
                patchState(store, setError(error.message)),
            })
          )
        )
      )
    );

    const callState$ = toObservable(callState);

    function canActivateWorkspace(guid: string): Observable<boolean> {
      return callState$.pipe(
        tap((callState) => callState == 'init' && loadAllWorkspaces()),
        filter((callState) => callState === 'loaded'),
        map(() => (!findWorkspace(workspaces(), guid) ? true : false))
      );
    }

    return { changeSelectedWorkspace, canActivateWorkspace, removeWorkspace };
  }),
  withHooks({
    onInit({ selectedWorkspaceId, ...store }) {
      const stateService = inject(StateService);

      stateService.clearAppState$.subscribe(() => {
        patchState(store, setWorkspaces([]), setSelectedWorkspaceId(null));

        localStorage.removeItem(CURRENT_WORKSPACE_STATE_KEY);
      });

      if (!selectedWorkspaceId()) {
        patchState(store, setDefaultSelectedId());
      }

      // when selectedWorkspaceId changes, persist on local storage
      effect(() => {
        if (selectedWorkspaceId()) {
          localStorage.setItem(
            CURRENT_WORKSPACE_STATE_KEY,
            selectedWorkspaceId() as string
          );
        }
      });
    },
  })
);

function setDefaultSelectedId(): PartialStateUpdater<State> {
  return (state) =>
    !!state.selectedWorkspaceId
      ? {}
      : { selectedWorkspaceId: state.workspaces[0]?.guid };
}

function setWorkspaces(workspaces: Workspace[]): PartialStateUpdater<State> {
  return () => ({ workspaces });
}

function setSelectedWorkspaceId(
  guid: string | undefined | null
): PartialStateUpdater<State> {
  return ({ selectedWorkspaceId }) => ({
    selectedWorkspaceId: !guid || selectedWorkspaceId == guid ? null : guid,
  });
}

function findWorkspace(
  workspaces: Workspace[],
  workspaceGuid: string | null
): Workspace | undefined {
  return workspaces.find((workspace) => workspace.guid === workspaceGuid);
}
