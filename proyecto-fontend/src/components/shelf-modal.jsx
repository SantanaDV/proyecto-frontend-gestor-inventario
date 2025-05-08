"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Unlink, Pencil } from "lucide-react"

export function ShelfModal({ shelf, onClose, onSave, onDelete, apiEndpoints }) {
  const [formData, setFormData] = useState({ ...shelf })
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

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

  // Añadir una nueva función para cargar productos sin estantería
  const [availableProducts, setAvailableProducts] = useState([])
  const [showAvailableProductsModal, setShowAvailableProductsModal] = useState(false)

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

  // Añadir función para asignar un producto existente a esta estantería
  const assignProductToShelf = async (product) => {
    setIsLoading(true)
    try {
      // Preparar el objeto producto con la estantería asignada
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
        id_estanteria: shelf.id,
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
                      {products.map((product) => (
                        <TableRow key={product.id_producto}>
                          <TableCell className="font-medium">{product.nombre}</TableCell>
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
                      ))}
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
          <DialogContent className="sm:max-w-[600px]">
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
    </>
  )
}
