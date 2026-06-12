import { createFileRoute } from '@tanstack/react-router'
import { Shell } from '../components/Shell'
import { AuthForm } from './login'

export const Route = createFileRoute('/signup')({
  component: () => <Shell><AuthForm mode="signup" /></Shell>,
})
