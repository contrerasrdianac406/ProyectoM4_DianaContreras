import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '../pages/DashboardPage'
import { MemoryRouter } from 'react-router-dom'
import * as taskServices from '../services/taskServices'


// Mock para simular que hay un usuario logueado
vi.mock('../features/auth/Authenticator', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', uid: '123' },
    logout: vi.fn(),
  }),
}))

// Mock para simular las tareas sin llamar a Firebase real
vi.mock('../services/taskServices', () => ({
  getTasks: vi.fn().mockResolvedValue([]),
  addTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
}))

describe('funciones básicas', () => {
  it('suma correctamente', () => {
    expect(2 + 2).toBe(4)
  })
})

describe('Elemento del DashboardPage', () => {
  it('Boton Cerrar sesión', async () => {
    render(
      <MemoryRouter>
        <DashboardPage/>
      </MemoryRouter>
    )
    const botonCerrarSesion = await screen.findByRole('button', { name: /Cerrar sesi[oó]n/i })
    expect(botonCerrarSesion).toBeInTheDocument()
  })
})

describe('Elemento del Dashboard page', () => {
  it('Titulo Dashboard', async () => {
    render(
      <MemoryRouter>
        <DashboardPage/>
      </MemoryRouter>
    )
    const tituloDashboard = await screen.findByText(/Dashboard/i)
    expect(tituloDashboard).toBeVisible()
  })

  it('permite escribir en el input task-title usando userEvent', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    // 1. Esperamos a que aparezca el input asociado a la etiqueta 'Nueva tarea'
    const inputTitulo = await screen.findByLabelText(/Nueva tarea/i)

    // 2. Verificamos que empiece vacío
    expect(inputTitulo).toHaveValue('')

    // 3. Simulamos la escritura del usuario tecla por tecla
    await user.type(inputTitulo, 'Comprar café')

    // 4. Verificamos que el valor cambió
    expect(inputTitulo).toHaveValue('Comprar café')
  })
})

describe('Formulario de nueva tarea (dashboard-form)', () => {
  it('permite escribir un título, descripción y enviar el formulario', async () => {
    // 1. Espiamos addTask para verificar con qué datos se llama
    const addTaskMock = vi.spyOn(taskServices, 'addTask').mockResolvedValue({
      id: 'task-1',
      title: 'Comprar leche',
      description: 'Deslactosada',
      completed: false,
      userId: '123',
      createdAt: new Date().toISOString(),
    })
    // Mockeamos fetch para que el envío de correo /api/send-email no falle
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Correo enviado' }),
    } as Response)
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    // 2. Esperamos a que los campos del formulario aparezcan en pantalla
    const inputTitulo = await screen.findByLabelText(/Nueva tarea/i)
    const inputDescripcion = screen.getByLabelText(/Descripción/i)
    const botonAgregar = screen.getByRole('button', { name: /Agregar/i })
    // 3. Simulamos que el usuario escribe en los inputs
    fireEvent.change(inputTitulo, { target: { value: 'Comprar leche' } })
    fireEvent.change(inputDescripcion, { target: { value: 'Deslactosada' } })
    expect(inputTitulo).toHaveValue('Comprar leche')
    expect(inputDescripcion).toHaveValue('Deslactosada')
    // 4. Hacemos clic en el botón "Agregar"
    fireEvent.click(botonAgregar)
    // 5. Verificamos que se haya llamado a addTask con los datos ingresados
    await waitFor(() => {
      expect(addTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Comprar leche',
          description: 'Deslactosada',
        })
      )
    })
    // 6. Verificamos que los inputs se hayan reseteado
    expect(inputTitulo).toHaveValue('')
    expect(inputDescripcion).toHaveValue('')
  })
})