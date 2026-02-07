import api from '../api'

const getPosts = async ({ pageParam = 1 }) => {
  const response = await api.get(`posts?_page=${pageParam}&_limit=20`);

  return response.data
}

export { getPosts }