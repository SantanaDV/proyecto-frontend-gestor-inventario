"use client"

import { useState, useEffect } from "react"
import { Grid, Grid3X3, Save, X, ChevronLeft, Warehouse, LayoutGrid, Package, RotateCcw } from "lucide-react"
import { ShelfModal } from "./shelf-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"

// API endpoints as constants
const API_ENDPOINTS = {
  WAREHOUSE: "http://127.0.0.1:8080/api/almacen",
  SHELF: "http://127.0.0.1:8080/api/estanteria",
  PRODUCT: "http://127.0.0.1:8080/api/producto",
}

// Door background image
const DOOR_IMAGE = "door.png"

export default function WarehouseManager() {
  // State
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [warehouseSize, setWarehouseSize] = useState(null)
  const [rows, setRows] = useState("10")
  const [cols, setCols] = useState("10")
  const [shelves, setShelves] = useState([])
  const [selectedShelf, setSelectedShelf] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("warehouses")
  const [warehouseName, setWarehouseName] = useState("Nuevo Almacén")
  const [cellSize, setCellSize] = useState(80) // Cell size in pixels
  const [isMoving, setIsMoving] = useState(false) // Estado para controlar si se está moviendo una estantería
  const [products, setProducts] = useState([]) // Todos los productos
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedShelfIds, setHighlightedShelfIds] = useState([])
  const [warehouseRotation, setWarehouseRotation] = useState(0)

  // Calcular la altura de la celda basada en el número de columnas
  const getCellHeight = (columns) => {
    return Math.max(60, Math.ceil(columns / 5) * 10 + 40)
  }

  // Load data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Obtener almacenes
        const warehouseResponse = await fetch(API_ENDPOINTS.WAREHOUSE)
        if (warehouseResponse.ok) {
          const warehouseData = await warehouseResponse.json()
          setWarehouses(
            warehouseData.map((warehouse) => ({
              id: warehouse.id_almacen,
              name: warehouse.ubicacion || `Almacén ${warehouse.id_almacen}`,
              rows: warehouse.fila,
              cols: warehouse.columna,
            })),
          )

          // Si hay almacenes, seleccionar el primero por defecto
          if (warehouseData.length > 0) {
            const firstWarehouse = {
              id: warehouseData[0].id_almacen,
              name: warehouseData[0].ubicacion || `Almacén ${warehouseData[0].id_almacen}`,
              rows: warehouseData[0].fila,
              cols: warehouseData[0].columna,
            }

            // Cargar estanterías para el primer almacén
            const shelfResponse = await fetch(`${API_ENDPOINTS.SHELF}/${firstWarehouse.id}`)
            if (shelfResponse.ok) {
              const shelfData = await shelfResponse.json()
              const formattedShelves = shelfData.map((shelf) => {
                // Verificar si es una puerta (posición termina en 'p')
                const isDoor = shelf.posicion.includes("p")
                // Extraer la posición sin la 'p' para el renderizado
                const posString = isDoor ? shelf.posicion.replace("p", "") : shelf.posicion
                const [row, col] = posString.split(",").map(Number)

                return {
                  id: shelf.id_estanteria,
                  name: isDoor ? `Puerta ${shelf.id_estanteria}` : `Estantería ${shelf.id_estanteria}`,
                  orientation: shelf.orientacion.toLowerCase(), // Asegurar que esté en minúsculas
                  position: { row, col },
                  products: [],
                  productCount: 0,
                  isDoor: isDoor,
                }
              })
              setShelves(formattedShelves)

              // Cargar todos los productos
              await loadAllProducts(formattedShelves)
            }

            setSelectedWarehouse(firstWarehouse)
            setWarehouseSize({ rows: firstWarehouse.rows, cols: firstWarehouse.cols })
            setRows(firstWarehouse.rows.toString())
            setCols(firstWarehouse.cols.toString())
            setWarehouseName(firstWarehouse.name)
            setActiveTab("editor")
          }
        }
      } catch (error) {
        console.error("Error fetching data from API", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Cargar todos los productos
  const loadAllProducts = async (shelvesList) => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT)
      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)

        // Actualizar las estanterías con el conteo de productos
        updateShelvesWithProductCounts(shelvesList, productsData)
      }
    } catch (error) {
      console.error("Error loading products", error)
    }
  }

  // Actualizar estanterías con conteo de productos
  const updateShelvesWithProductCounts = (shelvesList, productsData) => {
    // Crear un mapa de conteo de productos por estantería
    const productCountByShelf = {}
    const productsByShelf = {}

    // Inicializar todas las estanterías con 0 productos
    shelvesList.forEach((shelf) => {
      productCountByShelf[shelf.id] = 0
      productsByShelf[shelf.id] = []
    })

    // Contar productos por estantería
    productsData.forEach((product) => {
      if (product.estanteria && product.estanteria.id_estanteria) {
        const shelfId = product.estanteria.id_estanteria

        // Verificar si esta estantería está en nuestra lista
        if (shelvesList.some((s) => s.id === shelfId)) {
          if (!productCountByShelf[shelfId]) {
            productCountByShelf[shelfId] = 0
            productsByShelf[shelfId] = []
          }
          productCountByShelf[shelfId]++
          productsByShelf[shelfId].push(product)
        }
      }
    })

    // Actualizar las estanterías con el conteo
    const updatedShelves = shelvesList.map((shelf) => {
      return {
        ...shelf,
        productCount: productCountByShelf[shelf.id] || 0,
        products: productsByShelf[shelf.id] || [],
      }
    })

    setShelves(updatedShelves)
  }

  // Search for products and highlight shelves
  const searchProduct = async () => {
    if (!searchQuery.trim()) {
      setHighlightedShelfIds([])
      return
    }

    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT)
      if (response.ok) {
        const productsData = await response.json()

        // Filter products that match the search query
        const matchingProducts = productsData.filter((product) =>
          product.nombre?.toLowerCase().includes(searchQuery.toLowerCase()),
        )

        // Get unique shelf IDs from matching products
        const shelfIds = matchingProducts
          .filter((product) => product.estanteria && product.estanteria.id_estanteria)
          .map((product) => product.estanteria.id_estanteria)

        // Remove duplicates
        const uniqueShelfIds = [...new Set(shelfIds)]

        setHighlightedShelfIds(uniqueShelfIds)
      }
    } catch (error) {
      console.error("Error searching for products", error)
    }
  }

  // Update search results as user types
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchProduct()
    }, 300) // Pequeño retraso para evitar demasiadas búsquedas mientras se escribe

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Create a new warehouse
  const createWarehouse = async () => {
    const rowCount = Number.parseInt(rows)
    const colCount = Number.parseInt(cols)

    if (isNaN(rowCount) || isNaN(colCount) || rowCount <= 0 || colCount <= 0 || rowCount > 20 || colCount > 20) {
      setShowError(true)
      return
    }

    setShowError(false)
    setIsLoading(true)

    try {
      const newWarehouseData = {
        fila: rowCount,
        columna: colCount,
        ubicacion: warehouseName || `Almacén ${warehouses.length + 1}`,
      }

      const response = await fetch(API_ENDPOINTS.WAREHOUSE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWarehouseData),
      })

      if (response.ok) {
        const createdWarehouse = await response.json()
        const formattedWarehouse = {
          id: createdWarehouse.id_almacen,
          name: createdWarehouse.ubicacion,
          rows: createdWarehouse.fila,
          cols: createdWarehouse.columna,
        }

        setWarehouses([...warehouses, formattedWarehouse])
        selectWarehouse(formattedWarehouse)
      } else {
        console.error("Error creating warehouse")
      }
    } catch (error) {
      console.error("Error creating warehouse", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Select a warehouse
  const selectWarehouse = async (warehouse) => {
    setSelectedWarehouse(warehouse)
    setWarehouseSize({ rows: warehouse.rows, cols: warehouse.cols })
    setRows(warehouse.rows.toString())
    setCols(warehouse.cols.toString())
    setWarehouseName(warehouse.name)
    setActiveTab("editor")

    try {
      // Cargar estanterías para este almacén
      const response = await fetch(`${API_ENDPOINTS.SHELF}/${warehouse.id}`)
      if (response.ok) {
        const shelfData = await response.json()
        const formattedShelves = shelfData.map((shelf) => {
          // Verificar si es una puerta (posición termina en 'p')
          const isDoor = shelf.posicion.includes("p")
          // Extraer la posición sin la 'p' para el renderizado
          const posString = isDoor ? shelf.posicion.replace("p", "") : shelf.posicion
          const [row, col] = posString.split(",").map(Number)

          return {
            id: shelf.id_estanteria,
            name: isDoor ? `Puerta ${shelf.id_estanteria}` : `Estantería ${shelf.id_estanteria}`,
            orientation: shelf.orientacion.toLowerCase(),
            position: { row, col },
            products: [],
            productCount: 0,
            isDoor: isDoor,
          }
        })
        setShelves(formattedShelves)

        // Cargar productos para cada estantería
        await loadAllProducts(formattedShelves)
      } else {
        setShelves([])
      }
    } catch (error) {
      console.error("Error loading shelves", error)
      setShelves([])
    }
  }

  // Delete a warehouse
  const deleteWarehouse = async (id) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este almacén? Se eliminarán todas las estanterías y se desasociarán los productos.",
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      // Primero obtenemos todas las estanterías del almacén
      const shelvesResponse = await fetch(`${API_ENDPOINTS.SHELF}/${id}`)
      if (shelvesResponse.ok) {
        const shelves = await shelvesResponse.json()

        // Para cada estantería, desasociamos los productos
        for (const shelf of shelves) {
          // Obtenemos los productos de esta estantería
          const productsResponse = await fetch(`${API_ENDPOINTS.PRODUCT}`)
          if (productsResponse.ok) {
            const allProducts = await productsResponse.json()
            const shelfProducts = allProducts.filter(
              (product) => product.estanteria && product.estanteria.id_estanteria === shelf.id_estanteria,
            )

            // Desasociamos cada producto de la estantería
            for (const product of shelfProducts) {
              const updatedProduct = {
                ...product,
                estanteria: null,
              }

              await fetch(`${API_ENDPOINTS.PRODUCT}/${product.id_producto}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedProduct),
              })
            }
          }
        }
      }

      // Ahora eliminamos el almacén (la API debería manejar la eliminación de estanterías)
      const response = await fetch(`${API_ENDPOINTS.WAREHOUSE}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setWarehouses(warehouses.filter((w) => w.id !== id))
        if (selectedWarehouse?.id === id) {
          setSelectedWarehouse(null)
          setWarehouseSize(null)
          setShelves([])
        }
        alert("Almacén eliminado correctamente")
      } else {
        const errorText = await response.text()
        console.error("Error deleting warehouse:", errorText)
        alert(`Error al eliminar el almacén: ${errorText}`)
      }
    } catch (error) {
      console.error("Error deleting warehouse", error)
      alert(`Error al eliminar el almacén: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a shelf
  const addShelf = async (orientation, isDoor = false) => {
    if (!warehouseSize || !selectedWarehouse) return

    // Ensure doors are only vertical
    if (isDoor && orientation !== "vertical") {
      alert("Las puertas solo pueden ser verticales.")
      return
    }

    let found = false
    let newRow = 0
    let newCol = 0

    for (let row = 0; row < warehouseSize.rows; row++) {
      for (let col = 0; col < warehouseSize.cols; col++) {
        // Dependiendo de la orientación, calcula la segunda celda que ocuparía
        const secondRow = orientation === "vertical" ? row + 1 : row
        const secondCol = orientation === "horizontal" ? col + 1 : col

        // Asegúrate de que la estantería no se salga de los límites
        if (secondRow >= warehouseSize.rows || secondCol >= warehouseSize.cols) continue

        const conflict = shelves.some((s) => {
          const { row: sr, col: sc } = s.position
          const isSame = (r, c) =>
            (sr === r && sc === c) ||
            (s.orientation === "horizontal" && sr === r && sc + 1 === c) ||
            (s.orientation === "vertical" && sr + 1 === r && sc === c)
          return isSame(row, col) || isSame(secondRow, secondCol)
        })

        if (!conflict) {
          newRow = row
          newCol = col
          found = true
          break
        }
      }
      if (found) break
    }

    if (!found) {
      alert("No hay espacio disponible para una nueva estantería.")
      return
    }

    try {
      // Formato correcto para POST de estantería
      // Añadir 'p' al final de la posición si es una puerta
      const positionString = isDoor ? `${newRow},${newCol}p` : `${newRow},${newCol}`

      const newShelfData = {
        id_estanteria: null, // Null para que se genere automáticamente
        id_almacen: selectedWarehouse.id,
        posicion: positionString,
        orientacion: orientation.charAt(0).toUpperCase() + orientation.slice(1), // Capitalizar primera letra
      }

      console.log("Datos para crear estantería:", JSON.stringify(newShelfData))

      const response = await fetch(API_ENDPOINTS.SHELF, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newShelfData),
      })

      if (response.ok) {
        const createdShelf = await response.json()
        console.log("Estantería creada:", createdShelf)

        // Extraer la posición sin la 'p' para el renderizado
        let posRow = newRow
        let posCol = newCol
        if (isDoor && createdShelf.posicion.includes("p")) {
          const posParts = createdShelf.posicion.replace("p", "").split(",")
          posRow = Number.parseInt(posParts[0])
          posCol = Number.parseInt(posParts[1])
        }

        const formattedShelf = {
          id: createdShelf.id_estanteria,
          name: isDoor ? `Puerta ${createdShelf.id_estanteria}` : `Estantería ${createdShelf.id_estanteria}`,
          orientation: createdShelf.orientacion.toLowerCase(), // Convertir a minúsculas para mantener consistencia
          position: { row: posRow, col: posCol },
          products: [],
          productCount: 0,
          isDoor: isDoor, // Añadir propiedad para identificar puertas
        }

        setShelves([...shelves, formattedShelf])
      } else {
        const errorText = await response.text()
        console.error("Error creating shelf:", errorText)
        alert(`Error al crear estantería: ${errorText}`)
      }
    } catch (error) {
      console.error("Error creating shelf", error)
      alert(`Error al crear estantería: ${error.message}`)
    }
  }

  // Move a shelf
  const moveShelf = async (id, newRow, newCol) => {
    if (isMoving) return // Evitar múltiples operaciones simultáneas

    setIsMoving(true) // Indicar que se está moviendo una estantería

    try {
      // Obtener la estantería actual para mantener su orientación
      const currentShelf = shelves.find((s) => s.id === Number.parseInt(id))
      if (!currentShelf) {
        console.error("No se encontró la estantería con ID:", id)
        setIsMoving(false)
        return
      }

      console.log("Moviendo estantería:", id, "a posición:", `${newRow},${newCol}`)

      // Actualizar primero la UI para una experiencia más fluida
      const updatedShelves = shelves.map((shelf) =>
        shelf.id === Number.parseInt(id) ? { ...shelf, position: { row: newRow, col: newCol } } : shelf,
      )
      setShelves(updatedShelves)

      // Añadir 'p' al final de la posición si es una puerta
      const positionString = currentShelf.isDoor ? `${newRow},${newCol}p` : `${newRow},${newCol}`

      // Formato correcto para PUT de estantería
      const updateData = {
        id_estanteria: Number.parseInt(id), // Asegurarse de que sea un número
        id_almacen: Number.parseInt(selectedWarehouse.id), // Asegurarse de que sea un número
        posicion: positionString,
        orientacion: currentShelf.orientation.charAt(0).toUpperCase() + currentShelf.orientation.slice(1), // Capitalizar primera letra
      }

      console.log("Datos enviados al servidor para mover estantería:", JSON.stringify(updateData))

      // Luego enviar la actualización al servidor
      const response = await fetch(API_ENDPOINTS.SHELF, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error al actualizar estantería:", errorText)

        // Si falla, revertir el cambio en la UI
        const originalShelves = shelves.map((shelf) => ({ ...shelf })) // Copia profunda
        setShelves(originalShelves)

        alert(`Error al mover la estantería: ${errorText}`)
      } else {
        console.log("Estantería movida exitosamente")

        // Recargar las estanterías para asegurarse de que todo está sincronizado
        const refreshResponse = await fetch(`${API_ENDPOINTS.SHELF}/${selectedWarehouse.id}`)
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const refreshedShelves = refreshData.map((shelf) => {
            // Verificar si es una puerta (posición termina en 'p')
            const isDoor = shelf.posicion.includes("p")
            // Extraer la posición sin la 'p' para el renderizado
            const posString = isDoor ? shelf.posicion.replace("p", "") : shelf.posicion
            const [row, col] = posString.split(",").map(Number)

            return {
              id: shelf.id_estanteria,
              name: isDoor ? `Puerta ${shelf.id_estanteria}` : `Estantería ${shelf.id_estanteria}`,
              orientation: shelf.orientacion.toLowerCase(),
              position: { row, col },
              products: currentShelf.products || [],
              productCount: currentShelf.productCount || 0,
              isDoor: isDoor,
            }
          })
          setShelves(refreshedShelves)
          await loadAllProducts(refreshedShelves)
        }
      }
    } catch (error) {
      console.error("Error updating shelf position", error)

      // Revertir cambios en caso de error
      const originalShelves = [...shelves]
      setShelves(originalShelves)

      alert(`Error al mover la estantería: ${error.message}`)
    } finally {
      setIsMoving(false) // Finalizar el movimiento
    }
  }

  // Delete a shelf
  const deleteShelf = async (id) => {
    if (
      !confirm("¿Estás seguro de que deseas eliminar esta estantería? Los productos asociados quedarán sin estantería.")
    ) {
      return
    }

    try {
      setIsLoading(true)

      // Primero obtenemos todos los productos de esta estantería
      const productsResponse = await fetch(`${API_ENDPOINTS.PRODUCT}`)
      if (productsResponse.ok) {
        const allProducts = await productsResponse.json()
        const shelfProducts = allProducts.filter(
          (product) => product.estanteria && product.estanteria.id_estanteria === id,
        )

        // Desasociamos cada producto de la estantería
        for (const product of shelfProducts) {
          const updatedProduct = {
            ...product,
            estanteria: null,
          }

          await fetch(`${API_ENDPOINTS.PRODUCT}/${product.id_producto}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
          })
        }
      }

      // Ahora eliminamos la estantería
      const response = await fetch(`${API_ENDPOINTS.SHELF}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setShelves(shelves.filter((shelf) => shelf.id !== id))
        if (selectedShelf?.id === id) {
          setSelectedShelf(null)
        }
        alert("Estantería eliminada correctamente")
      } else {
        const errorText = await response.text()
        console.error("Error deleting shelf:", errorText)
        alert(`Error al eliminar la estantería: ${errorText}`)
      }
    } catch (error) {
      console.error("Error deleting shelf", error)
      alert(`Error al eliminar la estantería: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Open shelf modal
  const openShelfModal = (shelf) => {
    setSelectedShelf(shelf)
  }

  // Close shelf modal
  const closeShelfModal = () => {
    setSelectedShelf(null)
    // Recargar productos después de cerrar el modal para actualizar los conteos
    loadAllProducts(shelves)
  }

  // Save shelf changes
  const saveShelf = async (updatedShelf) => {
    try {
      // Formato correcto para PUT de estantería
      const updateData = {
        id_estanteria: updatedShelf.id,
        id_almacen: selectedWarehouse.id,
        posicion: `${updatedShelf.position.row},${updatedShelf.position.col}`,
        orientacion: updatedShelf.orientation.charAt(0).toUpperCase() + updatedShelf.orientation.slice(1), // Capitalizar primera letra
      }

      console.log("Datos enviados al guardar estantería:", JSON.stringify(updateData))

      const response = await fetch(API_ENDPOINTS.SHELF, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setShelves(shelves.map((shelf) => (shelf.id === updatedShelf.id ? updatedShelf : shelf)))
        closeShelfModal()
      } else {
        const errorText = await response.text()
        console.error("Error updating shelf:", errorText)
        alert(`Error al actualizar estantería: ${errorText}`)
      }
    } catch (error) {
      console.error("Error updating shelf", error)
      alert(`Error al actualizar estantería: ${error.message}`)
    }
  }

  // Drag and drop handlers
  const onDragStart = (e, shelf) => {
    if (isMoving) {
      e.preventDefault()
      return
    }

    // Guardar el ID de la estantería y su orientación
    e.dataTransfer.setData("shelfId", shelf.id.toString())
    e.dataTransfer.setData("orientation", shelf.orientation)

    // Añadir una clase visual para indicar que se está arrastrando
    e.currentTarget.classList.add("opacity-50")

    // Establecer la imagen de arrastre (opcional)
    const dragImage = document.createElement("div")
    dragImage.classList.add("drag-image")
    dragImage.textContent = shelf.name
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // Limpiar después
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }

  const onDragEnd = (e) => {
    // Restaurar la apariencia normal
    e.currentTarget.classList.remove("opacity-50")
  }

  const onDragOver = (e) => {
    e.preventDefault()
    // Añadir un indicador visual de que se puede soltar aquí
    e.currentTarget.classList.add("bg-gray-100")
  }

  const onDragLeave = (e) => {
    // Quitar el indicador visual
    e.currentTarget.classList.remove("bg-gray-100")
  }

  const onDrop = (e, row, col) => {
    e.preventDefault()

    // Quitar el indicador visual
    e.currentTarget.classList.remove("bg-gray-100")

    if (isMoving) return // No permitir soltar si ya hay una operación en curso

    const shelfId = e.dataTransfer.getData("shelfId")
    const orientation = e.dataTransfer.getData("orientation")

    console.log("Shelf ID recibido:", shelfId)
    console.log("Orientación recibida:", orientation)

    if (!shelfId) {
      console.error("No se recibió ID de estantería")
      return
    }

    const shelf = shelves.find((s) => s.id.toString() === shelfId.toString())
    if (!shelf) {
      console.error("No se encontró la estantería con ID:", shelfId)
      return
    }

    // Verificar si la posición es la misma que ya tiene
    if (shelf.position.row === row && shelf.position.col === col) {
      console.log("La estantería ya está en esa posición")
      return
    }

    // Check if the position is already occupied
    const isOccupied = shelves.some(
      (s) => s.id.toString() !== shelfId.toString() && s.position.row === row && s.position.col === col,
    )

    if (isOccupied) {
      console.log("Posición ocupada, no se puede mover")
      alert("Esta posición ya está ocupada por otra estantería.")
      return
    }

    // Verificar si la nueva posición respeta los límites según la orientación
    const isHorizontal = orientation === "horizontal"
    if ((isHorizontal && col + 1 >= warehouseSize.cols) || (!isHorizontal && row + 1 >= warehouseSize.rows)) {
      console.log("La estantería se saldría de los límites")
      alert("La estantería no cabe en esa posición.")
      return
    }

    // Verificar si la segunda celda que ocuparía está libre
    const secondRow = isHorizontal ? row : row + 1
    const secondCol = isHorizontal ? col + 1 : col

    const secondCellOccupied = shelves.some(
      (s) => s.id.toString() !== shelfId.toString() && s.position.row === secondRow && s.position.col === secondCol,
    )

    if (secondCellOccupied) {
      console.log("Segunda celda ocupada, no se puede mover")
      alert("La estantería no cabe en esa posición porque otra estantería ocupa parte del espacio.")
      return
    }

    console.log("Moviendo estantería a:", row, col)
    moveShelf(shelfId, row, col)
  }

  // Reset warehouse editor
  const resetEditor = () => {
    setSelectedWarehouse(null)
    setWarehouseSize(null)
    setShelves([])
    setActiveTab("warehouses")
  }

  // Render warehouse grid
  const renderWarehouseGrid = () => {
    if (!warehouseSize) return null

    const cellHeight = getCellHeight(warehouseSize.cols)

    // Calculate container size adjustments for rotation
    const isRotated = warehouseRotation % 180 !== 0
    const containerStyle = isRotated
      ? {
          height: `${cellHeight * warehouseSize.rows}px`,
          width: `${cellHeight * warehouseSize.rows}px`,
          margin: "0 auto",
        }
      : {
          height: `${cellHeight * warehouseSize.rows}px`,
          width: "100%",
        }

    return (
      <div className="bg-gray-50 border rounded-lg shadow-inner overflow-hidden">
        {/* Wrapper div for rotation */}
        <div
          className="flex items-center justify-center"
          style={{
            ...containerStyle,
            transition: "all 0.5s ease",
          }}
        >
          <div
            className="relative"
            style={{
              width: isRotated ? `${cellHeight * warehouseSize.cols}px` : "100%",
              height: `${cellHeight * warehouseSize.rows}px`,
              transform: `rotate(${warehouseRotation}deg)`,
              transition: "transform 0.5s ease",
            }}
          >
            {showGrid && (
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${warehouseSize.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${warehouseSize.rows}, ${cellHeight}px)`,
                }}
              >
                {Array.from({ length: warehouseSize.rows * warehouseSize.cols }).map((_, index) => {
                  const row = Math.floor(index / warehouseSize.cols)
                  const col = index % warehouseSize.cols
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 transition-colors duration-200"
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => onDrop(e, row, col)}
                      data-row={row}
                      data-col={col}
                    />
                  )
                })}
              </div>
            )}

            {/* Estanterías posicionadas */}
            {shelves.map((shelf) => {
              const { row, col } = shelf.position
              const isHorizontal = shelf.orientation === "horizontal"
              const isDoor = shelf.isDoor

              // Calcular posición exacta en píxeles
              const left = (col / warehouseSize.cols) * 100
              const top = (row / warehouseSize.rows) * 100
              const width = (isHorizontal ? 2 : 1) * (100 / warehouseSize.cols)
              const height = (isHorizontal ? 1 : 2) * (100 / warehouseSize.rows)

              return (
                <div
                  key={shelf.id}
                  className={`absolute flex flex-col items-center justify-center ${!isDoor ? "cursor-move" : "cursor-default"} rounded-md shadow-md transition-all duration-200 
                  ${highlightedShelfIds.includes(shelf.id) ? "bg-purple-600" : isDoor ? "" : isHorizontal ? "bg-emerald-500" : "bg-blue-500"} text-white hover:opacity-90`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `calc(${width}% - 2px)`,
                    height: `calc(${height}% - 2px)`,
                    zIndex: 10,
                    ...(isDoor
                      ? {
                          backgroundImage: `url(${DOOR_IMAGE})`,
                          backgroundSize: "70% 90%", // Reduce size to 70% width, 90% height
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          backgroundColor: "#f5f5f5", // Light background to show cell boundaries
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "4px",
                        }
                      : {
                          backgroundColor: highlightedShelfIds.includes(shelf.id)
                            ? "rgb(147 51 234)" // Purple for highlighted shelves
                            : isHorizontal
                              ? "rgb(16 185 129)"
                              : "rgb(59 130 246)",
                        }),
                  }}
                  draggable={!isMoving}
                  onDragStart={(e) => onDragStart(e, shelf)}
                  onDragEnd={onDragEnd}
                  onClick={() => !isDoor && openShelfModal(shelf)}
                  data-shelf-id={shelf.id}
                  data-orientation={shelf.orientation}
                  data-is-door={isDoor}
                >
                  <div className="text-xs font-medium truncate px-1 text-center w-full bg-black/50 rounded">
                    {!isDoor && shelf.name}
                  </div>
                  {!isDoor && (
                    <div className="flex items-center mt-1 bg-white text-black rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      <Package className="h-3 w-3 mr-1" />
                      {shelf.productCount}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg">Cargando...</p>
          </div>
        </div>
      )}

      {isMoving && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg">Moviendo estantería...</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="warehouses" onClick={() => setActiveTab("warehouses")}>
              <Warehouse className="h-4 w-4 mr-2" />
              Almacenes
            </TabsTrigger>
            <TabsTrigger value="editor" disabled={!selectedWarehouse}>
              <LayoutGrid className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
          </TabsList>

          {activeTab === "editor" && (
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Switch checked={showGrid} onCheckedChange={setShowGrid} id="grid-toggle" />
                      <Label htmlFor="grid-toggle">Cuadrícula</Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Mostrar/ocultar cuadrícula</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Almacén</CardTitle>
              <CardDescription>Define las dimensiones y el nombre de tu nuevo almacén</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse-name">Nombre del Almacén</Label>
                  <Input
                    id="warehouse-name"
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    placeholder="Nombre del almacén"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rows">Filas</Label>
                    <Input
                      id="rows"
                      type="number"
                      value={rows}
                      onChange={(e) => setRows(e.target.value)}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cols">Columnas</Label>
                    <Input
                      id="cols"
                      type="number"
                      value={cols}
                      onChange={(e) => setCols(e.target.value)}
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </div>
              {showError && (
                <p className="text-sm text-red-500">Por favor, ingresa dimensiones válidas (entre 1 y 20)</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={createWarehouse}>
                <Save className="h-4 w-4 mr-2" />
                Crear Almacén
              </Button>
            </CardFooter>
          </Card>

          {warehouses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mis Almacenes</CardTitle>
                <CardDescription>Selecciona un almacén para editarlo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warehouses.map((warehouse) => (
                    <Card key={warehouse.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                        <CardDescription>
                          {warehouse.rows} filas × {warehouse.cols} columnas
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => deleteWarehouse(warehouse.id)}>
                          <X className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                        <Button size="sm" onClick={() => selectWarehouse(warehouse)}>
                          <LayoutGrid className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedWarehouse && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedWarehouse.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedWarehouse.rows} filas × {selectedWarehouse.cols} columnas
                  </p>
                </div>
                <Button variant="outline" onClick={resetEditor}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Volver a Almacenes
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => addShelf("horizontal")} variant="default">
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        Estantería Horizontal
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Añadir estantería horizontal</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => addShelf("vertical")} variant="default">
                        <Grid className="h-4 w-4 mr-2" />
                        Estantería Vertical
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Añadir estantería vertical</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => addShelf("vertical", true)} variant="secondary">
                        <Grid className="h-4 w-4 mr-2" />
                        Puerta Vertical
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Añadir puerta vertical</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => setWarehouseRotation((prev) => (prev + 90) % 360)} variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rotar Vista
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotar vista del almacén</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="mt-4 mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                {highlightedShelfIds.length > 0 && (
                  <p className="text-sm mt-2">
                    {highlightedShelfIds.length === 1
                      ? "Producto encontrado en la estantería resaltada en "
                      : `Productos encontrados en ${highlightedShelfIds.length} estanterías resaltadas en `}
                    <span className="text-purple-600 font-bold">morado</span>
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Arrastra las estanterías para posicionarlas. Haz clic en una estantería para editarla.
                  </h3>
                </div>
                {renderWarehouseGrid()}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Shelf Modal */}
      {selectedShelf && (
        <ShelfModal
          shelf={selectedShelf}
          onClose={closeShelfModal}
          onSave={saveShelf}
          onDelete={() => deleteShelf(selectedShelf.id)}
          apiEndpoints={API_ENDPOINTS}
          searchQuery={searchQuery}
          disableProducts={selectedShelf.isDoor} // Disable products for doors
        />
      )}
    </div>
  )
}
