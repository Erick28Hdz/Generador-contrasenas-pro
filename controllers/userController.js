// 📦 Importación del modelo de usuario
const User = require('../models/user');

/**
 * Registra un usuario o lo autentica si ya existe
 */
exports.registerUser = async (req, res) => {
    const { correo, name, plan } = req.body;

    // ⚠️ Verifica que todos los campos necesarios estén presentes
    if (!correo || !name || !plan) {
        return res.status(400).json({ message: 'Correo, nombre y plan son requeridos' });
    }

    try {
        // 🔍 Busca si ya existe un usuario con ese correo
        let user = await User.findOne({ correo });

        // ✅ Si no existe, lo crea y guarda en la base de datos
        if (!user) {
            user = new User({ correo, name, plan });
            await user.save();
            console.log('🆕 Usuario nuevo creado');
        } else {
            // 🔁 Si ya existe, solo se considera autenticado
            console.log('✅ Usuario ya existe');
        }

        // 🔄 Respuesta con los datos del usuario autenticado o creado
        res.json({ message: 'Usuario autenticado', user });

    } catch (error) {
        // ❌ Manejo de errores en el proceso
        console.error('❌ Error al guardar usuario:', error);
        res.status(500).json({ message: 'Error al guardar el usuario' });
    }
};

// Función para actualizar el plan premium del usuario
exports.updateUserPlan = async (req, res) => {
    const { correo } = req.params;
    const { plan } = req.body;

    // ⚠️ Verifica que el nuevo plan esté incluido
    if (!plan) {
        return res.status(400).json({ error: 'El plan es necesario' });
    }

    try {
        // 🔍 Busca al usuario por su correo
        const user = await User.findOne({ correo });

        if (!user) {
            // ❌ Si no lo encuentra, responde con error 404
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // ✅ Asigna el nuevo plan y guarda los cambios
        user.plan = plan;
        await user.save();

        res.status(200).json({ message: 'Plan actualizado correctamente', user });

    } catch (error) {
        // ❌ Manejo de errores durante la actualización
        console.error('❌ Error al actualizar el plan:', error);
        res.status(500).json({ error: 'Error al actualizar el plan' });
    }
};

// ✅ Verifica si un usuario existe y devuelve sus datos
exports.getUserByEmail = async (req, res) => {
    const { correo } = req.params;

    try {
        // 🔍 Busca al usuario por correo
        const user = await User.findOne({ correo });

        if (!user) {
            // ❌ Si no existe, responde con error 404
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // ✅ Si lo encuentra, devuelve los datos del usuario
        res.status(200).json({ user });

    } catch (error) {
        // ❌ Manejo de errores en la consulta
        console.error('❌ Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};