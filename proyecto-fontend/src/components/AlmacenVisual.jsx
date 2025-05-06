"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Grid, Grid3X3, Save, X, ChevronLeft, Warehouse, LayoutGrid } from "lucide-react"
import { ShelfModal } from "./shelf-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

// API endpoints as constants - ready for future integration
const API_ENDPOINTS = {
  WAREHOUSE: "/api/almacen",
  SHELF: "/api/estanteria",
  PRODUCT: "/api/producto",
}

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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedWarehouses = localStorage.getItem("warehouses")
    const savedSelectedWarehouse = localStorage.getItem("selectedWarehouse")

    if (savedWarehouses) {
      try {
        setWarehouses(JSON.parse(savedWarehouses))
      } catch (error) {
        console.error("Error parsing warehouses from localStorage", error)
      }
    }

    if (savedSelectedWarehouse) {
      try {
        const parsedWarehouse = JSON.parse(savedSelectedWarehouse)
        setSelectedWarehouse(parsedWarehouse)
        setWarehouseSize({ rows: parsedWarehouse.rows, cols: parsedWarehouse.cols })
        setRows(parsedWarehouse.rows.toString())
        setCols(parsedWarehouse.cols.toString())
        setWarehouseName(parsedWarehouse.name)

        // Load shelves for this warehouse
        const savedShelves = localStorage.getItem(`shelves_${parsedWarehouse.id}`)
        if (savedShelves) {
          setShelves(JSON.parse(savedShelves))
        }
      } catch (error) {
        console.error("Error parsing selected warehouse from localStorage", error)
      }
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("warehouses", JSON.stringify(warehouses))
  }, [warehouses])

  useEffect(() => {
    if (selectedWarehouse) {
      localStorage.setItem("selectedWarehouse", JSON.stringify(selectedWarehouse))
    }
  }, [selectedWarehouse])

  useEffect(() => {
    if (selectedWarehouse) {
      localStorage.setItem(`shelves_${selectedWarehouse.id}`, JSON.stringify(shelves))
    }
  }, [shelves, selectedWarehouse])

  // Create a new warehouse
  const createWarehouse = () => {
    const rowCount = Number.parseInt(rows)
    const colCount = Number.parseInt(cols)

    if (isNaN(rowCount) || isNaN(colCount) || rowCount <= 0 || colCount <= 0 || rowCount > 20 || colCount > 20) {
      setShowError(true)
      return
    }

    setShowError(false)

    const newWarehouse = {
      id: `warehouse-${Date.now()}`,
      name: warehouseName || `Almacén ${warehouses.length + 1}`,
      rows: rowCount,
      cols: colCount,
    }

    setWarehouses([...warehouses, newWarehouse])
    selectWarehouse(newWarehouse)
  }

  // Select a warehouse
  const selectWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setWarehouseSize({ rows: warehouse.rows, cols: warehouse.cols })
    setRows(warehouse.rows.toString())
    setCols(warehouse.cols.toString())
    setWarehouseName(warehouse.name)
    setActiveTab("editor")

    // Load shelves for this warehouse
    const savedShelves = localStorage.getItem(`shelves_${warehouse.id}`)
    if (savedShelves) {
      setShelves(JSON.parse(savedShelves))
    } else {
      setShelves([])
    }
  }

  // Delete a warehouse
  const deleteWarehouse = (id) => {
    setWarehouses(warehouses.filter((w) => w.id !== id))
    if (selectedWarehouse?.id === id) {
      setSelectedWarehouse(null)
      setWarehouseSize(null)
      setShelves([])
    }
    localStorage.removeItem(`shelves_${id}`)
  }

  // Add a shelf
  const addShelf = (orientation) => {
    if (!warehouseSize) return
  
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
          const isSame = (r, c) => (sr === r && sc === c) ||
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
  
    const newShelf = {
      id: `shelf-${Date.now()}`,
      name: `Estantería ${shelves.length + 1}`,
      orientation,
      position: { row: newRow, col: newCol },
      products: [],
    }
  
    setShelves([...shelves, newShelf])
  }

  // Move a shelf
  const moveShelf = (id, newRow, newCol) => {
    const updatedShelves = shelves.map((shelf) =>
      shelf.id === id ? { ...shelf, position: { row: newRow, col: newCol } } : shelf,
    )
    setShelves(updatedShelves)
  }

  // Delete a shelf
  const deleteShelf = (id) => {
    setShelves(shelves.filter((shelf) => shelf.id !== id))
    if (selectedShelf?.id === id) {
      setSelectedShelf(null)
    }
  }

  // Open shelf modal
  const openShelfModal = (shelf) => {
    setSelectedShelf(shelf)
  }

  // Close shelf modal
  const closeShelfModal = () => {
    setSelectedShelf(null)
  }

  // Save shelf changes
  const saveShelf = (updatedShelf) => {
    setShelves(shelves.map((shelf) => (shelf.id === updatedShelf.id ? updatedShelf : shelf)))
    closeShelfModal()
  }

  // Drag and drop handlers
  const onDragStart = (e, shelf) => {
    e.dataTransfer.setData("shelfId", shelf.id)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDrop = (e, row, col) => {
    e.preventDefault()
    const shelfId = e.dataTransfer.getData("shelfId")
    const shelf = shelves.find((s) => s.id === shelfId)
    if (!shelf) return

    // Check if the position is already occupied
    const isOccupied = shelves.some((s) => s.id !== shelfId && s.position.row === row && s.position.col === col)

    if (isOccupied) return

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

    return (
      <div className="overflow-auto bg-gray-50 border rounded-lg shadow-inner h-[600px]">
  <div
    className="relative w-full h-full"
  >
    {showGrid && (
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${warehouseSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${warehouseSize.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: warehouseSize.rows * warehouseSize.cols }).map((_, index) => (
          <div
            key={index}
            className="border border-gray-200"
            onDragOver={onDragOver}
            onDrop={(e) => {
              const row = Math.floor(index / warehouseSize.cols)
              const col = index % warehouseSize.cols
              onDrop(e, row, col)
            }}
          />
        ))}
      </div>
    )}

    {/* Estanterías posicionadas */}
    {shelves.map((shelf) => {
      const { row, col } = shelf.position
      const isHorizontal = shelf.orientation === "horizontal"

      return (
        <div
          key={shelf.id}
          className={`absolute flex items-center justify-center cursor-move rounded-md shadow-md transition-all duration-200 
            ${isHorizontal ? "bg-emerald-500" : "bg-blue-500"} text-white hover:opacity-90`}
          style={{
            left: `calc(${(col / warehouseSize.cols) * 100}% + 1px)`,
            top: `calc(${(row / warehouseSize.rows) * 100}% + 1px)`,
            width: `calc(${isHorizontal ? 2 : 1} * (100% / ${warehouseSize.cols}) - 2px)`,
            height: `calc(${isHorizontal ? 1 : 2} * (100% / ${warehouseSize.rows}) - 2px)`,
            zIndex: 10,
          }}
          draggable
          onDragStart={(e) => onDragStart(e, shelf)}
          onClick={() => openShelfModal(shelf)}
        >
          <div className="text-xs font-medium truncate px-1 text-center">
            {shelf.name}
            {shelf.products && shelf.products.length > 0 && (
              <div className="mt-1">
                <Badge variant="secondary" className="text-[10px]">
                  {shelf.products.length} productos
                </Badge>
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
</div>
    )
  }

  return (
    <div className="container mx-auto p-4">
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
        />
      )}
    </div>
  )
}
