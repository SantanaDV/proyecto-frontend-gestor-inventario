"use client"

/**
 * @fileoverview Modal específico para la gestión de estanterías.
 * Permite ver detalles de una estantería y realizar operaciones sobre ella.
 *
 * @component ShelfModal
 * @requires React
 * @requires ../utilities/apiComunicator
 * @requires ../components/ui/dialog
 * @requires ../components/ui/button
 */

/**
 * @fileoverview Componente modal para gestionar estanterías
 * Permite ver, asignar y desasignar productos a una estantería
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Unlink, Search } from "lucide-react"

/**
 * Modal para visualizar y gestionar los detalles de una estantería específica.
 * Permite ver productos almacenados, editar propiedades y realizar otras operaciones.
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.shelf - Datos de la estantería a mostrar
 * @param {Function} props.onRefresh - Función para actualizar los datos después de cambios
 * @returns {JSX.Element} Modal con detalles y opciones de gestión de la estantería
 */
export function ShelfModal({ shelf, onClose, onSave, onDelete, apiEndpoints, searchQuery = "" }) {
  // Estados para gestionar el formulario y los datos
  const [formData, setFormData] = useState({ ...shelf })
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Cargar productos de esta estantería específica
        const productsResponse = await fetch(`${apiEndpoints.PRODUCT}`)
        if (productsResponse.ok) {
          const allProducts = await productsResponse.json()
          // Filtrar solo los productos que pertenecen a esta estantería
          const shelfProducts = allProducts.filter(
            (product) => product.estanteria && product.estanteria.id_estanteria === shelf.id,
          )
          setProducts(shelfProducts)
        }

        // Cargar categorías
        const categoriesResponse = await fetch(`${apiEndpoints.PRODUCT}/categorias`)
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [shelf.id, apiEndpoints.PRODUCT])

  // Estados para gestionar productos disponibles
  const [availableProducts, setAvailableProducts] = useState([])
  const [showAvailableProductsModal, setShowAvailableProductsModal] = useState(false)

  /**
   * Carga productos sin estantería asignada
   */
  const loadAvailableProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiEndpoints.PRODUCT}`)
      if (response.ok) {
        const allProducts = await response.json()
        // Filtrar productos que no tienen estantería asignada
        const productsWithoutShelf = allProducts.filter((product) => !product.estanteria || product.estanteria === null)
        setAvailableProducts(productsWithoutShelf)
        setShowAvailableProductsModal(true)
      }
    } catch (error) {
      console.error("Error cargando productos disponibles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Estados para gestionar la asignación de productos a baldas
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showBaldaModal, setShowBaldaModal] = useState(false)
  const [baldaValue, setBaldaValue] = useState("")

  /**
   * Prepara la asignación de un producto a la estantería
   * @param {Object} product - Producto a asignar
   */
  const assignProductToShelf = (product) => {
    setSelectedProduct(product)
    setShowBaldaModal(true)
  }

  /**
   * Completa la asignación de un producto a la estantería
   */
  const completeProductAssignment = async () => {
    if (!selectedProduct || !baldaValue) return

    // Validar que el número de balda sea mayor que 0
    const baldaNumber = Number.parseInt(baldaValue)
    if (baldaNumber <= 0) {
      alert("El número de balda debe ser mayor que 0")
      return
    }

    setIsLoading(true)
    try {
      // Preparar el objeto producto con la estantería asignada y la balda
      const updatedProduct = {
        id_producto: selectedProduct.id_producto,
        nombre: selectedProduct.nombre,
        cantidad: selectedProduct.cantidad,
        estado: selectedProduct.estado,
        codigoQr: selectedProduct.codigoQr,
        url_img: selectedProduct.url_img,
        fecha_creacion: selectedProduct.fecha_creacion,
        nfc_id: selectedProduct.nfc_id,
        id_categoria: selectedProduct.categoria?.id || selectedProduct.id_categoria,
        id_estanteria: shelf.id,
        balda: baldaNumber,
      }

      console.log("Enviando producto:", updatedProduct)

      // Crear un objeto FormData y añadir el producto como un campo
      const formData = new FormData()
      formData.append("producto", JSON.stringify(updatedProduct))

      const response = await fetch(`${apiEndpoints.PRODUCT}`, {
        method: "PUT",
        body: formData,
      })

      if (response.ok) {
        const savedProduct = await response.json()
        setProducts([...products, savedProduct])
        setShowAvailableProductsModal(false)
        setShowBaldaModal(false)
        setBaldaValue("")
        setSelectedProduct(null)

        // Recargar los productos después de asignar
        const productsResponse = await fetch(`${apiEndpoints.PRODUCT}`)
        if (productsResponse.ok) {
          const allProducts = await productsResponse.json()
          const shelfProducts = allProducts.filter((p) => p.estanteria && p.estanteria.id_estanteria === shelf.id)
          setProducts(shelfProducts)
        }
      } else {
        const errorText = await response.text()
        throw new Error(errorText)
      }
    } catch (error) {
      console.error("Error asignando producto:", error)
      alert(`Error al asignar producto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave(formData)
    } catch (error) {
      console.error("Error al guardar la estantería:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Desasigna un producto de la estantería
   * @param {number} productId - ID del producto a desasignar
   */
  const handleUnassignProduct = async (productId) => {
    if (!confirm("¿Estás seguro de que deseas desasignar este producto de la estantería?")) return

    setIsLoading(true)
    try {
      // Primero obtenemos el producto actual
      const productResponse = await fetch(`${apiEndpoints.PRODUCT}/${productId}`)
      if (!productResponse.ok) {
        throw new Error("No se pudo obtener la información del producto")
      }

      const product = await productResponse.json()

      // Preparar el objeto producto con la estantería asignada a null
      const updatedProduct = {
        id_producto: product.id_producto,
        nombre: product.nombre,
        cantidad: product.cantidad,
        estado: product.estado,
        codigoQr: product.codigoQr,
        url_img: product.url_img,
        fecha_creacion: product.fecha_creacion,
        nfc_id: product.nfc_id,
        id_categoria: product.categoria?.id || product.id_categoria,
        id_estanteria: null, // Establecer a null para desasignar
      }

      // Crear un objeto FormData y añadir el producto como un campo
      const formData = new FormData()
      formData.append("producto", JSON.stringify(updatedProduct))

      const response = await fetch(`${apiEndpoints.PRODUCT}`, {
        method: "PUT",
        body: formData,
      })

      if (response.ok) {
        // Eliminar el producto de la lista local
        setProducts(products.filter((p) => p.id_producto !== productId))
        alert("Producto desasignado correctamente")
      } else {
        const errorText = await response.text()
        throw new Error(errorText)
      }
    } catch (error) {
      console.error("Error desasignando producto:", error)
      alert(`Error al desasignar el producto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Verifica si un producto coincide con la búsqueda
   * @param {Object} product - Producto a verificar
   * @returns {boolean} true si el producto coincide con la búsqueda
   */
  const matchesSearch = (product) => {
    if (!searchQuery || searchQuery.trim() === "") return false
    return product.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  }

  // Ordenar productos para que los que coinciden con la búsqueda aparezcan primero
  const sortedProducts = [...products].sort((a, b) => {
    const aMatches = matchesSearch(a)
    const bMatches = matchesSearch(b)

    if (aMatches && !bMatches) return -1
    if (!aMatches && bMatches) return 1
    return 0
  })

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Detalles de Estantería</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <input
                  type="text"
                  value={formData.name}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  readOnly={true}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Productos ({products.length})</Label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={loadAvailableProducts}>
                    <Package className="h-4 w-4 mr-1" />
                    Productos Disponibles
                  </Button>
                </div>
              </div>

              {products.length > 0 ? (
                <div className="border rounded-md max-h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Balda</TableHead>
                        <TableHead className="w-[100px] text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedProducts.map((product) => {
                        const isHighlighted = matchesSearch(product)
                        return (
                          <TableRow key={product.id_producto} className={isHighlighted ? "bg-purple-100" : ""}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {isHighlighted && <Search className="h-4 w-4 mr-1 text-purple-600" />}
                                <span className={isHighlighted ? "text-purple-700 font-bold" : ""}>
                                  {product.nombre}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{product.cantidad}</TableCell>
                            <TableCell>
                              <Badge variant={product.estado === "activo" ? "success" : "secondary"}>
                                {product.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.categoria?.descripcion}</TableCell>
                            <TableCell>{product.balda}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnassignProduct(product.id_producto)}
                                  className="flex items-center"
                                >
                                  <Unlink className="h-4 w-4 mr-1" />
                                  Desasignar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No hay productos en esta estantería</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="destructive" onClick={() => onDelete(shelf.id)}>
                Eliminar Estantería
              </Button>
              <div className="flex-1"></div>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showAvailableProductsModal && (
        <Dialog open={true} onOpenChange={() => setShowAvailableProductsModal(false)}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Productos Disponibles</DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-auto">
              {availableProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="w-[100px] text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableProducts.map((product) => (
                      <TableRow key={product.id_producto}>
                        <TableCell className="font-medium">{product.nombre}</TableCell>
                        <TableCell>{product.cantidad}</TableCell>
                        <TableCell>{product.categoria?.descripcion}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => assignProductToShelf(product)}>
                            Asignar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-4">
                  <p>No hay productos disponibles para asignar</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAvailableProductsModal(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showBaldaModal && selectedProduct && (
        <Dialog open={true} onOpenChange={() => setShowBaldaModal(false)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Seleccionar Balda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="balda">Número de Balda</Label>
                <input
                  id="balda"
                  type="number"
                  value={baldaValue}
                  onChange={(e) => setBaldaValue(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  placeholder="Ingrese el número de balda"
                  min="1"
                />
                {Number(baldaValue) <= 0 && baldaValue !== "" && (
                  <p className="text-sm text-red-500 mt-1">El número de balda debe ser mayor que 0</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBaldaModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={completeProductAssignment}
                disabled={!baldaValue || isLoading || Number(baldaValue) <= 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asignar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}