export interface Author {
  name: string
  avatar: string
}

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  imageUrl: string
  author: Author
}

