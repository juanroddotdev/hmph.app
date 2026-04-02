import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const GROUPS_KEY = 'hmpf-groups'
const POST_GROUPS_KEY = 'hmpf-post-groups'

function loadGroups(): string[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    if (!raw) return ['food', 'thoughts', 'mad']
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : ['food', 'thoughts', 'mad']
  } catch {
    return ['food', 'thoughts', 'mad']
  }
}

function loadPostGroups(): Record<string, string> {
  try {
    const raw = localStorage.getItem(POST_GROUPS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<string[]>(loadGroups())
  const postGroups = ref<Record<string, string>>(loadPostGroups())

  watch(
    groups,
    (v) => {
      try {
        localStorage.setItem(GROUPS_KEY, JSON.stringify(v))
      } catch {}
    },
    { deep: true }
  )

  watch(
    postGroups,
    (v) => {
      try {
        localStorage.setItem(POST_GROUPS_KEY, JSON.stringify(v))
      } catch {}
    },
    { deep: true }
  )

  function addGroup(name: string): boolean {
    const n = name.trim().toLowerCase()
    if (!n || groups.value.includes(n)) return false
    groups.value = [...groups.value, n]
    return true
  }

  function renameGroup(oldName: string, newName: string): boolean {
    const n = newName.trim().toLowerCase()
    if (!n || n === oldName) return false
    if (!groups.value.includes(oldName)) return false
    if (groups.value.includes(n)) return false
    groups.value = groups.value.map((g) => (g === oldName ? n : g))
    const next = { ...postGroups.value }
    for (const [postId, g] of Object.entries(next)) {
      if (g === oldName) next[postId] = n
    }
    postGroups.value = next
    return true
  }

  function removeGroup(name: string) {
    groups.value = groups.value.filter((g) => g !== name)
    for (const [postId, g] of Object.entries(postGroups.value)) {
      if (g === name) {
        const next = { ...postGroups.value }
        delete next[postId]
        postGroups.value = next
      }
    }
  }

  function assignPostToGroup(postId: string, groupName: string) {
    postGroups.value = { ...postGroups.value, [postId]: groupName }
  }

  function removePostFromGroup(postId: string) {
    const next = { ...postGroups.value }
    delete next[postId]
    postGroups.value = next
  }

  function getPostGroup(postId: string): string | null {
    return postGroups.value[postId] ?? null
  }

  return {
    groups,
    postGroups,
    addGroup,
    renameGroup,
    removeGroup,
    assignPostToGroup,
    removePostFromGroup,
    getPostGroup,
  }
})
