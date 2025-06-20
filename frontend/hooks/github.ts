import {
  createCommit,
  createRepo,
  getGitHubAuthUrl,
  getGitHubUser,
  getRepoStatus,
  githubLogin,
  githubLogout,
  removeRepo,
} from "@/lib/actions"
import { router } from "react-query-kit"

export const github = router("github", {
  githubUser: router.query({
    fetcher: getGitHubUser,
  }),
  login: router.mutation({
    mutationFn: githubLogin,
  }),
  logout: router.mutation({
    mutationFn: githubLogout,
  }),
  gethAuthUrl: router.mutation({
    mutationFn: getGitHubAuthUrl,
  }),
  createCommit: router.mutation({
    mutationFn: createCommit,
  }),
  createRepo: router.mutation({
    mutationFn: createRepo,
  }),
  removeRepo: router.mutation({
    mutationFn: removeRepo,
  }),
  repoStatus: router.query({
    fetcher: getRepoStatus,
  }),
})
