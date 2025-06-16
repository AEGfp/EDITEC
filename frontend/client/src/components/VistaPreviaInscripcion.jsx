export default function VistaPreviaInscripcion({ datos }) {
  if (datos === null) {
    return (
      <div className="mensaje-error">
        No se recibiron los datos correctemente
      </div>
    );
  }
  return (
    <div className="espaciado">
      <h2 className="text-xl font-bold mb-4">Revisión final de inscripción</h2>

      {/* Usuario (si no se omite) */}
      {"username" in datos && (
        <>
          <h3 className="font-semibold mt-4">Cuenta del Tutor</h3>
          <p>
            <strong>Usuario:</strong> {datos.username}
          </p>
          <p>
            <strong>Email:</strong> {datos.email}
          </p>
          <p>
            <strong>Nombre:</strong> {datos.nombre} {datos.apellido}{" "}
            {datos.segundo_apellido}
          </p>
          <p>
            <strong>CI:</strong> {datos.ci}
          </p>
          <p>
            <strong>Fecha de nacimiento:</strong> {datos.fecha_nacimiento}
          </p>
          <p>
            <strong>Sexo:</strong> {datos.sexo}
          </p>
          <p>
            <strong>Domicilio:</strong> {datos.domicilio}
          </p>
        </>
      )}

      {/* Datos del Tutor */}
      <h3 className="font-semibold mt-4">Datos del Tutor</h3>
      <p>
        <strong>Es docente:</strong> {datos.es_docente ? "Sí" : "No"}
      </p>
      <p>
        <strong>Es estudiante:</strong> {datos.es_estudiante ? "Sí" : "No"}
      </p>
      <p>
        <strong>Es funcionario:</strong> {datos.es_funcionario ? "Sí" : "No"}
      </p>
      <p>
        <strong>Tel. Casa:</strong> {datos.telefono_casa}
      </p>
      <p>
        <strong>Tel. Particular:</strong> {datos.telefono_particular}
      </p>
      <p>
        <strong>Tel. Trabajo:</strong> {datos.telefono_trabajo}
      </p>
      <p>
        <strong>Empresa:</strong> {datos.nombre_empresa_trabajo}
      </p>
      <p>
        <strong>Dirección Trabajo:</strong> {datos.direccion_trabajo}
      </p>
      <p>
        <strong>Observaciones:</strong> {datos.observaciones}
      </p>

      {/* Datos del Infante */}
      <h3 className="font-semibold mt-4">Datos del Infante</h3>
      <p>
        <strong>Nombre:</strong> {datos.infante_nombre} {datos.infante_apellido}{" "}
        {datos.infante_segundo_apellido}
      </p>
      <p>
        <strong>CI:</strong> {datos.infante_ci}
      </p>
      <p>
        <strong>Fecha de nacimiento:</strong> {datos.infante_fecha_nacimiento}
      </p>
      <p>
        <strong>Sexo:</strong> {datos.infante_sexo}
      </p>
      <p>
        <strong>Domicilio:</strong> {datos.infante_domicilio}
      </p>

      {/* Datos específicos del infante */}
      <h3 className="font-semibold mt-4">Salud y Permisos</h3>
      <p>
        <strong>Alergia:</strong> {datos.ind_alergia ? "Sí" : "No"}
      </p>
      <p>
        <strong>Intolerancia a la lactosa:</strong>{" "}
        {datos.ind_intolerancia_lactosa ? "Sí" : "No"}
      </p>
      <p>
        <strong>Celiaquismo:</strong> {datos.ind_celiaquismo ? "Sí" : "No"}
      </p>
      <p>
        <strong>Permiso para cambio de pañal:</strong>{" "}
        {datos.permiso_cambio_panhal === "S" ? "Sí" : "No"}
      </p>
      <p>
        <strong>Permiso para fotos:</strong>{" "}
        {datos.permiso_fotos === "S" ? "Sí" : "No"}
      </p>
      <p>
        <strong>ID Sala:</strong> {datos.id_sala}
      </p>

      {/* Archivos subidos */}
      <h3 className="font-semibold mt-4">Documentos Adjuntos</h3>
      {datos.archivo_permiso_fotos && (
        <p>✅ Permiso fotos: {datos.archivo_permiso_fotos.name}</p>
      )}
      {datos.archivo_permiso_panhal && (
        <p>✅ Permiso cambio pañal: {datos.archivo_permiso_panhal.name}</p>
      )}
      {datos.archivo_cedula_tutor && (
        <p>✅ Cédula del tutor: {datos.archivo_cedula_tutor.name}</p>
      )}
      {datos.archivo_cedula_infante && (
        <p>✅ Cédula del infante: {datos.archivo_cedula_infante.name}</p>
      )}
      {datos.archivo_relacion_UNA && (
        <p>✅ Relación UNA: {datos.archivo_relacion_UNA.name}</p>
      )}
      {datos.archivo_libreta_vacunacion && (
        <p>✅ Libreta de vacunación: {datos.archivo_libreta_vacunacion.name}</p>
      )}

      {Object.keys(datos).map((key) =>
        key.startsWith("archivo_discapacidad_") && datos[key] ? (
          <p key={key}>✅ Discapacidad: {datos[key].name}</p>
        ) : null
      )}
    </div>
  );
}
