import emailjs from '@emailjs/browser'
import { Observer } from './Observer.js'

/** Observador que usa EmailJS para enviar alertas al administrador. */
export class EmailJSObserver extends Observer {
  constructor(serviceId, templateId, publicKey, gateway) {
    super()
    this.serviceId = serviceId
    this.templateId = templateId
    this.publicKey = publicKey
    this.gateway = gateway
    this.notificados = new Set() // Evitar spam para el mismo id
  }

  actualizar(evento, datos) {
    // Solo reaccionamos si es una alerta de caducidad
    if (evento !== 'alerta-caducidad') return
    
    // datos es un array de alimentos en riesgo
    datos.forEach((producto) => {
      // Si el producto no ha sido notificado, enviamos el correo
      if (!this.notificados.has(producto.id)) {
        this.enviarCorreo(producto)
        this.notificados.add(producto.id)
      }
    })
  }

  async enviarCorreo(producto) {
    try {
      // Obtener todos los usuarios de la base de datos local
      const usuarios = (await this.gateway.obtener('usuarios')) || []
      // Filtrar aquellos que tengan el rol 'admin' y estén activos
      const admins = usuarios.filter((u) => u.rol === 'admin' && u.estado === 'activo')

      if (admins.length === 0) {
        console.warn('[EmailJS] No hay administradores activos para notificar.')
        return
      }

      const fechaFormat = new Date(producto.fechaCaducidad).toLocaleDateString()
      const lote = producto.lote || 'Sin lote'
      
      const templateParams = {
        producto_nombre: producto.nombre,
        producto_lote: lote,
        fecha_caducidad: fechaFormat,
        mensaje: `${producto.cantidad} ${producto.unidad} de ${producto.nombre} del lote ${lote} está pronto a caducar: ${fechaFormat}`
      }

      // Enviamos un correo a cada admin de forma asincrónica
      await Promise.all(
        admins.map((admin) => {
          return emailjs.send(
            this.serviceId,
            this.templateId,
            { ...templateParams, to_email: admin.email, admin_nombre: admin.nombre },
            this.publicKey
          ).then(() => {
            console.log(`[EmailJS] Correo de alerta enviado a admin: ${admin.email}`)
          })
        })
      )
    } catch (error) {
      console.error('[EmailJS] Error al enviar el correo:', error)
    }
  }
}
