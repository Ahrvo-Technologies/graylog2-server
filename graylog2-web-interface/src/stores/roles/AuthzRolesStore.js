// @flow strict
import Reflux from 'reflux';
import * as Immutable from 'immutable';

import type { UserOverviewJSON } from 'logic/users/UserOverview';
import type { Store } from 'stores/StoreTypes';
import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import { qualifyUrl } from 'util/URLUtils';
import { singletonStore } from 'views/logic/singleton';
import PaginationURL from 'util/PaginationURL';
import Role from 'logic/roles/Role';
import type { RoleJSON } from 'logic/roles/Role';
import AuthzRolesActions from 'actions/roles/AuthzRolesActions';
import UserOverview from 'logic/users/UserOverview';

import type { PaginatedResponseType, PaginationType } from '../PaginationTypes';

type PaginatedResponse = PaginatedResponseType & {
  roles: Array<RoleJSON>,
};

export type PaginatedListType = {
  list: Immutable.List<Role>,
  pagination: PaginationType,
};

export type PaginatedUserListType = {
  list: Immutable.List<UserOverview>,
  pagination: PaginationType,
};

type PaginatedUserResponse = PaginatedResponseType & {
  users: Array<UserOverviewJSON>,
};

// eslint-disable-next-line camelcase
const _responseToPaginatedList = ({ count, total, page, per_page, query, roles = [] }: PaginatedResponse) => {
  return {
    list: Immutable.List(roles.map((r) => Role.fromJSON(r))),
    pagination: {
      count,
      total,
      page,
      perPage: per_page,
      query,
    },
  };
};

// eslint-disable-next-line camelcase
const _responseToPaginatedUserList = ({ count, total, page, per_page, query, users }: PaginatedUserResponse) => {
  return {
    list: Immutable.List(users.map((u) => UserOverview.fromJSON(u))),
    pagination: {
      count,
      total,
      page,
      perPage: per_page,
      query,
    },
  };
};

const AuthzRolesStore: Store<{}> = singletonStore(
  'AuthzRoles',
  () => Reflux.createStore({
    listenables: [AuthzRolesActions],

    load(roleId: $PropertyType<Role, 'id'>): Promise<Role> {
      const url = qualifyUrl(ApiRoutes.AuthzRolesController.load(encodeURIComponent(roleId)).url);
      const promise = fetch('GET', url).then(Role.fromJSON);

      AuthzRolesActions.load.promise(promise);

      return promise;
    },

    delete(roleId: string): Promise<void> {
      const url = qualifyUrl(ApiRoutes.AuthzRolesController.delete(encodeURIComponent(roleId)).url);
      const promise = fetch('DELETE', url);

      AuthzRolesActions.delete.promise(promise);

      return promise;
    },

    addMembers(roleId: string, usernames: Immutable.Set<string>): Promise<Role> {
      const { url } = ApiRoutes.AuthzRolesController.addMembers(roleId);
      const promise = fetch('PUT', qualifyUrl(url), usernames.toArray());

      AuthzRolesActions.addMembers.promise(promise);

      return promise;
    },

    removeMember(roleId: string, username: string): Promise<Role> {
      const { url } = ApiRoutes.AuthzRolesController.removeMember(roleId, username);
      const promise = fetch('DELETE', qualifyUrl(url));

      AuthzRolesActions.removeMember.promise(promise);

      return promise;
    },

    loadUsersForRole(roleId: string, roleName: string, page: number, perPage: number, query: string): Promise<PaginatedUserListType> {
      const url = PaginationURL(ApiRoutes.AuthzRolesController.loadUsersForRole(roleId).url, page, perPage, query);

      const promise = fetch('GET', qualifyUrl(url))
        .then(_responseToPaginatedUserList);

      AuthzRolesActions.loadUsersForRole.promise(promise);

      return promise;
    },

    loadRolesForUser(username: string, page: number, perPage: number, query: string): Promise<PaginatedListType> {
      const url = PaginationURL(ApiRoutes.AuthzRolesController.loadRolesForUser(username).url, page, perPage, query);

      const promise = fetch('GET', qualifyUrl(url))
        .then(_responseToPaginatedList);

      AuthzRolesActions.loadRolesForUser.promise(promise);

      return promise;
    },

    loadRolesPaginated(page: number, perPage: number, query: string): Promise<PaginatedListType> {
      const url = PaginationURL(ApiRoutes.AuthzRolesController.list().url, page, perPage, query);

      const promise = fetch('GET', qualifyUrl(url))
        .then(_responseToPaginatedList);

      AuthzRolesActions.loadRolesPaginated.promise(promise);

      return promise;
    },
  }),
);

export { AuthzRolesActions, AuthzRolesStore };
