"use client"

/**
 * @fileoverview Página de calendario que muestra eventos y permite gestionar actividades programadas.
 * Integra un calendario interactivo con funcionalidades de gestión de eventos.
 *
 * @component Calendar
 * @requires React
 * @requires react-router-dom
 * @requires ../utilities/apiComunicator
 * @requires ../components/ui/LoadingSpinner
 * @requires ../components/ui/ErrorMessage
 */

/**
 * @fileoverview Página de calendario de tareas
 * Muestra las tareas en un calendario mensual
 */

import { useState, useEffect } from "react"
import axios from "axios"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeaderFuncional from "@/components/HeaderFuncional"

/**
 * Página que muestra un calendario interactivo con eventos y actividades programadas.
 * Permite visualizar, crear, editar y eliminar eventos del calendario.
 *
 * @returns {JSX.Element} Página completa del calendario con sus funcionalidades
 */
export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([])

  // Días de la semana para el encabezado del calendario
  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  /**
   * Carga las tareas desde la API al montar el componente
   */
  useEffect(() => {
    // Función para obtener las tareas de la API
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/tarea")
        const tasks = response.data

        // Procesar las tareas para ajustarlas al formato que queremos en el calendario
        const formattedEvents = tasks.map((task) => {
          return {
            id: task.id,
            title: task.descripcion,
            date: new Date(task.fecha_asignacion),
            endDate: task.fecha_finalizacion ? new Date(task.fecha_finalizacion) : null,
            estado: task.estado,
            empleado: task.empleado_asignado || "Sin asignar",
          }
        })

        setEvents(formattedEvents)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      }
    }

    fetchTasks()
  }, [])

  /**
   * Obtiene los datos del mes para el calendario
   * @param {Date} date - Fecha del mes a mostrar
   * @returns {Array} Matriz de semanas con días
   */
  const getMonthData = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Ajustar para que la semana comience el lunes (0 = lunes, 6 = domingo)
    let firstDayOfWeek = firstDay.getDay() - 1
    if (firstDayOfWeek === -1) firstDayOfWeek = 6

    const daysFromPrevMonth = firstDayOfWeek
    const totalDays = 42 // 6 semanas x 7 días
    const calendarDays = []

    // Días del mes anterior
    const prevMonth = new Date(year, month - 1)
    const prevMonthLastDay = new Date(year, month, 0).getDate()

    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      calendarDays.push({
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i),
        isCurrentMonth: false,
      })
    }

    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      calendarDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Días del mes siguiente
    const nextMonth = new Date(year, month + 1)
    const remainingDays = totalDays - calendarDays.length

    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
        isCurrentMonth: false,
      })
    }

    // Agrupar los días en semanas
    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    return weeks
  }

  // Obtener las semanas del mes actual
  const weeks = getMonthData(currentMonth)

  /**
   * Formatea el mes y año para mostrar en el encabezado
   * @param {Date} date - Fecha a formatear
   * @returns {string} Mes y año formateados
   */
  const formatMonth = (date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  /**
   * Navega al mes anterior
   */
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  /**
   * Navega al mes siguiente
   */
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  /**
   * Navega al mes actual
   */
  const handleToday = () => {
    setCurrentMonth(new Date())
  }

  /**
   * Obtiene los eventos para una fecha específica
   * @param {Date} date - Fecha para la que se buscan eventos
   * @returns {Array} Lista de eventos para la fecha
   */
  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        (event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear()) ||
        (event.endDate &&
          event.endDate.getDate() === date.getDate() &&
          event.endDate.getMonth() === date.getMonth() &&
          event.endDate.getFullYear() === date.getFullYear()),
    )
  }

  /**
   * Verifica si una fecha es hoy
   * @param {Date} date - Fecha a verificar
   * @returns {boolean} true si la fecha es hoy
   */
  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  /**
   * Obtiene el color de fondo según el estado de la tarea
   * @param {string} estado - Estado de la tarea
   * @returns {string} Clases CSS para el color de fondo
   */
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Por hacer":
        return "bg-red-100 border-red-300 text-red-800"
      case "En Proceso":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "Finalizada":
        return "bg-green-100 border-green-300 text-green-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  return (
    <>
      <HeaderFuncional />
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg border my-5 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-red-700 text-white">
          <h2 className="text-xl font-semibold">{formatMonth(currentMonth)}</h2>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg overflow-hidden bg-white">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none border-r h-10 text-red-700 hover:text-red-900 hover:bg-gray-100"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none h-10 text-red-700 hover:text-red-900 hover:bg-gray-100"
                onClick={handleToday}
              >
                Hoy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none border-l h-10 text-red-700 hover:text-red-900 hover:bg-gray-100"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b bg-gray-100">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-3 text-center font-medium text-sm text-gray-700">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 h-[calc(100vh-12rem)] min-h-[600px]">
          {weeks.flat().map((day, index) => {
            const dayEvents = getEventsForDate(day.date)
            const isTodayDay = isToday(day.date)

            return (
              <div
                key={index}
                className={`border-b border-r p-1 relative ${
                  !day.isCurrentMonth ? "bg-gray-50 text-gray-400" : "hover:bg-gray-50 cursor-pointer"
                } transition-colors duration-200`}
                onClick={() => day.isCurrentMonth}
              >
                <div className="flex flex-col h-full">
                  <div className={`flex items-start justify-between ${isTodayDay ? "mb-1" : ""}`}>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 ${
                        isTodayDay
                          ? "bg-red-600 text-white rounded-full"
                          : day.isCurrentMonth
                            ? "text-gray-700"
                            : "text-gray-400"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1.5 mb-1 rounded border ${getStatusColor(event.estado)} shadow-sm`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75 mt-0.5 truncate">{event.empleado}</div>
                        {event.endDate &&
                          event.endDate.getDate() === day.date.getDate() &&
                          event.endDate.getMonth() === day.date.getMonth() &&
                          event.endDate.getFullYear() === day.date.getFullYear() && (
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                              <span className="text-xs">Finaliza hoy</span>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}