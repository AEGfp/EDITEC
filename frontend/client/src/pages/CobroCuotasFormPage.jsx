import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  obtenerInfantes,
  obtenerCuota, // Usaremos obtenerCuota para las cuotas por infante
  registrarCobroCuota,
  obtenerDetalleCuota,
} from '../api/saldocuotas.api';
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import ValidarNumero from "../components/ValidarNumero";
import moment from 'moment';

export function CobrosCuotasFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    getValues,
  } = useForm();

  const [editable, setEditable] = useState(true);
  const [infantes, setInfantes] = useState([]);
  const [selectedInfante, setSelectedInfante] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [cuotaDetails, setCuotaDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const pagina = '/cajas-cobros';
  //const params = useParams();

  const puedeEscribir = tienePermiso('cajasCobros', 'escritura');

  // Cargar infantes
  useEffect(() => {
    async function cargarInfantes() {
      //try {
        const { data } = await obtenerInfantes();
        setInfantes(data.map((inf) => ({
          value: inf.id,
          label: inf.nombre,
        })));
      //} catch (err) {
      //  setError('Error al cargar los infantes');
      //}
    }
    if (puedeEscribir) {
      cargarInfantes();
    }
  }, [puedeEscribir]);

  // Cargar cuotas al seleccionar un infante
  useEffect(() => {
    async function cargarCuotas() {
      if (selectedInfante) {
        try {
          const { data } = await obtenerCuota(selectedInfante.value);
          const cuotasPendientes = data.filter((cuota) => !cuota.estado);
          setCuotas(
            cuotasPendientes.map((cuota) => ({
              value: cuota.id,
              label: `Cuota ${cuota.nro_cuota} (${cuota.mes}/${cuota.anho}) - Saldo: ${cuota.saldo}`,
            }))
          );
        } catch (err) {
          setError('Error al cargar las cuotas');
        }
      } else {
        setCuotas([]);
        setSelectedCuota(null);
      }
    }
    cargarCuotas();
  }, [selectedInfante]);

  // Cargar detalles de la cuota y actualizar según la fecha de cobro
  useEffect(() => {
    async function cargarDetallesCuota() {
      if (selectedCuota) {
        try {
          const fechaCobro = getValues('fecha_cobro') || moment().format('YYYY-MM-DD');
          const { data } = await obtenerDetalleCuota(selectedCuota.value, { fecha_cobro: fechaCobro });
          setCuotaDetails(data);
          setValue('monto_cobrado', data.monto_total);
        } catch (err) {
          setError('Error al cargar detalles de la cuota');
        }
      } else {
        setCuotaDetails(null);
        setValue('monto_cobrado', '');
      }
    }
    cargarDetallesCuota();
  }, [selectedCuota, getValues, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedInfante) {
      setError('Debe seleccionar un infante');
      return;
    }
    if (!selectedCuota) {
      setError('Debe seleccionar una cuota');
      return;
    }
    setIsModalOpen(true);
  });

  const handleConfirmarCobro = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await registrarCobroCuota({
        cuota_id: selectedCuota.value,
        monto_cobrado: getValues('monto_cobrado'),
        fecha_cobro: getValues('fecha_cobro'),
        observacion: getValues('observacion'),
      });
      setSuccess('Cobro registrado con éxito');
      setIsModalOpen(false);
      setSelectedInfante(null);
      setSelectedCuota(null);
      setCuotaDetails(null);
      setValue('monto_cobrado', '');
      setValue('fecha_cobro', moment().format('YYYY-MM-DD'));
      setValue('observacion', '');
      setCuotas([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el cobro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Registrar Cobro de Cuota</h1>

        {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-500 text-white p-2 rounded mb-4">{success}</div>}

        <form onSubmit={onSubmit} id="registrar-cobro">
          <fieldset disabled={!editable || !puedeEscribir}>
            <h4 className="formulario-elemento">Infante</h4>
            <Select
              options={infantes}
              value={selectedInfante}
              onChange={(option) => {
                setSelectedInfante(option);
                setSelectedCuota(null);
                setCuotaDetails(null);
                setError('');
              }}
              placeholder="Seleccione un infante..."
              className="mb-4"
              isDisabled={!puedeEscribir}
            />
            {errors.infante && <CampoRequerido />}

            <h4 className="formulario-elemento">Cuota</h4>
            <Select
              options={cuotas}
              value={selectedCuota}
              onChange={(option) => {
                setSelectedCuota(option);
                setError('');
              }}
              placeholder="Seleccione una cuota..."
              className="mb-4"
              isDisabled={!puedeEscribir || !selectedInfante}
            />
            {errors.cuota && <CampoRequerido />}

            {cuotaDetails && (
              <div className="mb-4">
                <h4 className="formulario-elemento">Detalles de la Cuota</h4>
                <p>Monto de la Cuota: {cuotaDetails.monto_cuota}</p>
                <p>Mora Estimada: {cuotaDetails.mora_estimada}</p>
                <p><strong>Monto Total a Pagar: {cuotaDetails.monto_total}</strong></p>
              </div>
            )}

            <h4 className="formulario-elemento">Fecha de Cobro</h4>
            <input
              type="date"
              defaultValue={moment().format('YYYY-MM-DD')}
              max={moment().format('YYYY-MM-DD')} // Evitar fechas futuras
              className="formulario-input"
              {...register('fecha_cobro', {
                required: true,
                validate: (value) => {
                  if (moment(value).isAfter(moment())) {
                    return 'La fecha de cobro no puede ser futura';
                  }
                  return true;
                },
              })}
              onChange={(e) => {
                setValue('fecha_cobro', e.target.value);
                // Recargar detalles de cuota con nueva fecha
                if (selectedCuota) {
                  obtenerDetalleCuota(selectedCuota.value, { fecha_cobro: e.target.value }).then(({ data }) => {
                    setCuotaDetails(data);
                    setValue('monto_cobrado', data.monto_total);
                  });
                }
              }}
            />
            {errors.fecha_cobro && <p className="text-red-500">{errors.fecha_cobro.message || 'Campo requerido'}</p>}

            <h4 className="formulario-elemento">Monto a Cobrar</h4>
            <input
              type="number"
              step="0.01"
              value={cuotaDetails?.monto_total || ''}
              className="formulario-input"
              readOnly
              {...register('monto_cobrado', {
                required: true,
                min: 0.01,
              })}
            />
            {errors.monto_cobrado && <CampoRequerido />}

            <h4 className="formulario-elemento">Observaciones</h4>
            <textarea
              placeholder="Ingrese observaciones (opcional)..."
              className="formulario-input"
              {...register('observacion')}
            />
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && editable && (
            <button
              type="submit"
              form="registrar-cobro"
              className="boton-guardar"
              disabled={isLoading || !selectedCuota}
            >
              Registrar Cobro
            </button>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Confirmar Cobro</h2>
              <p className="mb-6">
                ¿Está seguro de registrar un cobro de {cuotaDetails?.monto_total} para la cuota {selectedCuota?.label} del infante {selectedInfante?.label}?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  onClick={handleConfirmarCobro}
                  disabled={isLoading}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}