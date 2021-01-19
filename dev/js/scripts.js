/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* ==============================================================================================
   PROGRAMA CRUD - CONTROL Y MANEJO CRÍA DE CONEJOS (PRACTICA USO DE API IndexedDB).
   VERSIÓN: 0.1
   FECHA: 26/08/2020
   REALIZADO POR: NEWMAN FERRER
   ============================================================================================== */

/* UBICACIÓN DE ELEMENTOS EN EL DOCUMENTO HTML
================================================================================================= */
// Manejo de agregar conejo (agregar.html)
// --------------------------------------------------------------------------------------------
const formularioAgregar = document.querySelector('#formularioAgregar');
const divTextFile = document.querySelector('.container-formulario__formularioAgregar__text-field');
const divButton = document.querySelector('.container-formulario__formularioAgregar__container-button');
// --------------------------------------------------------------------------------------------

// Manejo de agregar montas - conejos machos (agregar-montas.html)
// --------------------------------------------------------------------------------------------
const formularioBuscarMontas = document.querySelector('#formularioBuscarMontas');
const divMontaEncontrada = document.querySelector('#container-formularioMontaEncontrada');
// --------------------------------------------------------------------------------------------

// Manejo de agregar partos - conejos hembras (agregar-partos.html)
// --------------------------------------------------------------------------------------------
const formularioBuscarPartos = document.querySelector('#formularioBuscarPartos');
const divPartoEncontrado = document.querySelector('#container-formularioPartosEncontrados');
// --------------------------------------------------------------------------------------------

// Manejo de buscar conejos (buscar.html)
// --------------------------------------------------------------------------------------------
const formularioBuscar = document.querySelector('#formularioBuscar');
const divDataEncontrada = document.querySelector('#container__formularioDataEncontrada');
// --------------------------------------------------------------------------------------------

// Manejo de mostrar conejos (mostrar.html)
// --------------------------------------------------------------------------------------------
const divContainerInformacionItems = document.querySelector('#container-informacion__items');
// --------------------------------------------------------------------------------------------

// Manejo de mostrar montas (mostrar-montas.html)
// --------------------------------------------------------------------------------------------
const mostrarFormularioBuscarMontas = document.querySelector('#mostrar__formularioBuscarMontas');
const mostrarDivMontasEncontradas = document.querySelector('#mostrar__container-formularioMontasEncontradas');
// --------------------------------------------------------------------------------------------

// Manejo de mostrar partos (mostrar-partos.html)
// --------------------------------------------------------------------------------------------
const mostrarFormularioBuscarPartos = document.querySelector('#mostrar__formularioBuscarPartos');
const mostrarDivPartosEncontrados = document.querySelector('#mostrar__container-formularioPartosEncontrados');
// --------------------------------------------------------------------------------------------

// Manejo de mostrar conejos por raza usando index (mostrar-raza.html)
// --------------------------------------------------------------------------------------------
const formularioSelectRaza = document.querySelector('#formularioRaza');
const divRazaEncontrada = document.querySelector('#container-razaEncontrada');
// --------------------------------------------------------------------------------------------

// Manejo de mostrar conejos por sexo usando index (mostrar-sexo.html)
// --------------------------------------------------------------------------------------------
const formularioSelectSexo = document.querySelector('#formularioSexo');
const divSexoEncontrado = document.querySelector('#container-sexoEncontrado');
// --------------------------------------------------------------------------------------------

// Manejo de errores
// ---------------------------------------------------------------------------------------------
const containerError = document.querySelector('#container-error');
const pError = document.querySelector('#container-error__parrafo');
// ---------------------------------------------------------------------------------------------
/* ============================================================================================== */

/* CONSTANTES Y VARIABLES GLOBALES
================================================================================================= */
const IndexedDB = window.indexedDB; // Creamos objeto IndexedDB
const DB_NAME = 'DB_BugsBunny';
const DB_VERSION = 1;
const DB_STORE_NAME = 'conejos';
let dataBase; // Variable dónde guardaremos proximamente la base de datos (DB_BugsBunny)

let errores = []; // Array que almacenara los errores
let totalConejos; // En las busquedas por index, guarda el total de conejos en la BD
let totalCoincidencias; // En las busquedas por index, guarda el total de coincidencias en la BD
/* ============================================================================================== */

/* FUNCIONES
================================================================================================= */
// 1.- FUNCIÓN QUE AGREGA UN NUEVO CONEJO A LA BASE DE DATOS
// ---------------------------------------------------------------------------------------------
function agregarConejo(Ccodigo, Csexo, Craza, Clinea, Cgenotipo, CfenotipoD, CfenotipoR, Cnacimiento, Cpeso) {
  let request;

  const conejoMacho = {
    codigo: Ccodigo,
    sexo: Csexo,
    raza: Craza,
    linea: Clinea,
    genotipo: Cgenotipo,
    fenotipoD: CfenotipoD,
    fenotipoR: CfenotipoR,
    nacimiento: Cnacimiento,
    peso: Cpeso,
    estado: true,
    montas: [],
  };

  const conejoHembra = {
    codigo: Ccodigo,
    raza: Craza,
    linea: Clinea,
    sexo: Csexo,
    genotipo: Cgenotipo,
    fenotipoD: CfenotipoD,
    fenotipoR: CfenotipoR,
    nacimiento: Cnacimiento,
    peso: Cpeso,
    estado: true,
    partos: [],
  };

  const transaction = dataBase.transaction(['conejos'], 'readwrite');
  const objectStore = transaction.objectStore('conejos');

  if (Csexo === 'Macho') {
    request = objectStore.add(conejoMacho);
  } else if (Csexo === 'Hembra') {
    request = objectStore.add(conejoHembra);
  }

  request.onsuccess = (() => {
    transaction.oncomplete = (() => {
      errores = [];
      containerError.classList.remove('container-error-visible');
      pError.textContent = '';

      if (window.location.pathname.includes('/agregar.html')) {
        formularioAgregar.reset();
        formularioAgregar.inputCodigo.focus();
        console.log(`Conejo codigo: ${Ccodigo}, agregado correctamente a la BD`);
      }
    });
  });

  request.onerror = (() => {
    // Datos que podemos capturar del error
    // console.log(`Error Code: ${request.error.code}`);
    // console.log(`Error Name: ${request.error.name}`);
    // console.log(`Error Message: ${request.error.message}`);

    if (request.error.code === 0) {
      errores.push(`Error: código ${Ccodigo}, ya existe en la BD`);
      containerError.classList.add('container-error-visible');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');

      formularioAgregar.inputCodigo.focus();
    }
  });
}
// ---------------------------------------------------------------------------------------------

// 2.- FUNCIÓN QUE BUSCA Y AGREGA UNA NUEVA MONTA A UN CONEJO EN LA BASE DE DATOS.
//     NOTA: - Incluye evento de escucha del submit para agregar nueva monta.
// ---------------------------------------------------------------------------------------------
function buscarMontas(codigoBuscar) {
  errores = [];
  divMontaEncontrada.textContent = '';
  containerError.classList.remove('container-error-visible');
  let dataConejo; // Toda la data

  const transaction = dataBase.transaction(['conejos'], 'readwrite');
  const objectStore = transaction.objectStore('conejos');
  const request = objectStore.get(codigoBuscar);

  const fragment = document.createDocumentFragment();

  request.onsuccess = (() => {
    transaction.oncomplete = (() => {
      if (request.result === undefined) {
        errores.push(`Error: código ${codigoBuscar}, no existe en la BD.`);
      } else if (request.result.sexo === 'Hembra') {
        errores.push(`Error: código ${request.result.codigo} sexo ${request.result.sexo}, macho requerido`);
      }

      if (errores.length > 0) {
        containerError.classList.add('container-error-visible');
        pError.textContent = '';
        pError.innerHTML = errores.join(', ');
      } else {
        // Variable con toda la data del conejo encontrado
        dataConejo = request.result;

        // formulario que contendrá la data encontrada
        const formularioMontaEncontrada = document.createElement('form');
        formularioMontaEncontrada.setAttribute('id', 'formularioMontaEncontrada');
        formularioMontaEncontrada.classList.add('container-buscarMontas__container-formularioMontaEncontrada__formularioMontaEncontrada');

        // input código
        const labelCodigo = document.createElement('label');
        labelCodigo.textContent = 'Código:';
        labelCodigo.setAttribute('for', 'inputCodigo');

        const inputCodigo = document.createElement('input');
        inputCodigo.value = request.result.codigo;
        inputCodigo.setAttribute('id', 'inputCodigo');
        inputCodigo.setAttribute('type', 'text');
        inputCodigo.setAttribute('name', 'inputCodigo');
        inputCodigo.setAttribute('minlength', '1');
        inputCodigo.setAttribute('maxlength', '5');
        inputCodigo.setAttribute('autocomplete', 'off');
        inputCodigo.setAttribute('disabled', 'disabled');

        formularioMontaEncontrada.appendChild(labelCodigo);
        formularioMontaEncontrada.appendChild(inputCodigo);

        // Montas Número
        const labelMontaNumero = document.createElement('label');
        labelMontaNumero.textContent = 'Monta No.:';
        labelMontaNumero.setAttribute('for', 'inputMontaNumero');

        const inputMontaNumero = document.createElement('input');
        inputMontaNumero.value = ((request.result.montas.length) + 1);
        inputMontaNumero.setAttribute('disabled', 'disabled');
        inputMontaNumero.setAttribute('id', 'inputMontaNumero');
        inputMontaNumero.setAttribute('type', 'number');
        inputMontaNumero.setAttribute('name', 'inputMontaNumero');
        inputMontaNumero.setAttribute('min', '0');
        inputMontaNumero.setAttribute('max', '60');

        formularioMontaEncontrada.appendChild(labelMontaNumero);
        formularioMontaEncontrada.appendChild(inputMontaNumero);

        // Monta Fecha
        const labelMontaFecha = document.createElement('label');
        labelMontaFecha.textContent = 'Monta Fecha:';
        labelMontaFecha.setAttribute('for', 'dateMontaFecha');

        const dateMontaFecha = document.createElement('input');
        dateMontaFecha.value = '';
        dateMontaFecha.setAttribute('id', 'dateMontaFecha');
        dateMontaFecha.setAttribute('type', 'date');
        dateMontaFecha.setAttribute('name', 'dateMontaFecha');

        formularioMontaEncontrada.appendChild(labelMontaFecha);
        formularioMontaEncontrada.appendChild(dateMontaFecha);

        // Monta Efectividad
        const labelMontaEfectividad = document.createElement('label');
        labelMontaEfectividad.textContent = 'Monta Efect. (%):';
        labelMontaEfectividad.setAttribute('for', 'inputMontaEfectividad');

        const inputMontaEfectividad = document.createElement('input');
        inputMontaEfectividad.value = '';
        inputMontaEfectividad.setAttribute('id', 'inputMontaEfectividad');
        inputMontaEfectividad.setAttribute('type', 'number');
        inputMontaEfectividad.setAttribute('name', 'inputMontaEfectividad');
        inputMontaEfectividad.setAttribute('min', '0');
        inputMontaEfectividad.setAttribute('max', '100');

        formularioMontaEncontrada.appendChild(labelMontaEfectividad);
        formularioMontaEncontrada.appendChild(inputMontaEfectividad);

        // Botón agregar nueva monta
        const buttonAgregarMonta = document.createElement('button');
        buttonAgregarMonta.textContent = 'Agregar';
        buttonAgregarMonta.setAttribute('name', 'buttonAgregarMonta');
        buttonAgregarMonta.setAttribute('data-action', 'AgregarMontar');
        buttonAgregarMonta.dataset.type = 'AgregarMonta';
        buttonAgregarMonta.dataset.key = request.result.codigo;

        formularioMontaEncontrada.appendChild(buttonAgregarMonta);

        // Append Generales (Mostrar toda la data)
        fragment.appendChild(formularioMontaEncontrada);
        divMontaEncontrada.appendChild(fragment);

        // Evento de escucha para agregar monta
        // ------------------------------------------------------------------------------------------
        formularioMontaEncontrada.addEventListener('submit', (event) => {
          event.preventDefault();

          const CMontaNumero = formularioMontaEncontrada.inputMontaNumero.value;
          const CMontaFecha = formularioMontaEncontrada.dateMontaFecha.value;
          const CMontaEfectividad = formularioMontaEncontrada.inputMontaEfectividad.value;

          const conejoMonta = {
            numero: CMontaNumero,
            fecha: CMontaFecha,
            efectividad: CMontaEfectividad,
          };

          dataConejo.montas.push(conejoMonta);

          const transactionAgregarMonta = dataBase.transaction(['conejos'], 'readwrite');
          const objectStoreAgregarMonta = transactionAgregarMonta.objectStore('conejos');
          const requestAgregarMonta = objectStoreAgregarMonta.put(dataConejo);

          requestAgregarMonta.onsuccess = (() => {
            transactionAgregarMonta.oncomplete = (() => {
              console.log(`conejo codigo: ${request.result.codigo}, monta agregada en la bd`);
              formularioMontaEncontrada.textContent = '';
              formularioBuscarMontas.inputBuscarMontas.focus();
            });
          });
        });
        // ------------------------------------------------------------------------------------------
      }
    });
  });

  request.onerror = ((error) => {
    console.log('Error', error);
  });
}
// ---------------------------------------------------------------------------------------------

// 3.- FUNCIÓN QUE BUSCA Y AGREGA UN NUEVO PARTO A UN CONEJO EN LA BASE DE DATOS.
//     NOTA: - Incluye evento de escucha del submit para agregar nuevo parto.
// ---------------------------------------------------------------------------------------------
function buscarPartos(codigoBuscar) {
  errores = [];
  divPartoEncontrado.textContent = '';
  containerError.classList.remove('container-error-visible');
  let dataConejo; // Toda la data

  const transaction = dataBase.transaction(['conejos'], 'readwrite');
  const objectStore = transaction.objectStore('conejos');
  const request = objectStore.get(codigoBuscar);

  const fragment = document.createDocumentFragment();

  request.onsuccess = (() => {
    transaction.oncomplete = (() => {
      if (request.result === undefined) {
        errores.push(`Error: código ${codigoBuscar}, no existe en la BD.`);
      } else if (request.result.sexo === 'Macho') {
        errores.push(`Error: código ${request.result.codigo} sexo ${request.result.sexo}, hembra requerido`);
      }

      if (errores.length > 0) {
        containerError.classList.add('container-error-visible');
        pError.textContent = '';
        pError.innerHTML = errores.join(', ');
      } else {
        // Variable con toda la data del conejo encontrado
        dataConejo = request.result;

        // formulario que contendrá la data del parto encontrado
        const formularioPartoEncontrado = document.createElement('form');
        formularioPartoEncontrado.setAttribute('id', 'formularioPartoEncontrado');
        formularioPartoEncontrado.classList.add('container-buscarPartos__container-formularioPartosEncontrados__formularioPartosEncontrados');

        // input código
        const labelCodigo = document.createElement('label');
        labelCodigo.textContent = 'Código:';
        labelCodigo.setAttribute('for', 'inputCodigo');

        const inputCodigo = document.createElement('input');
        inputCodigo.value = request.result.codigo;
        inputCodigo.setAttribute('id', 'inputCodigo');
        inputCodigo.setAttribute('type', 'text');
        inputCodigo.setAttribute('name', 'inputCodigo');
        inputCodigo.setAttribute('minlength', '1');
        inputCodigo.setAttribute('maxlength', '5');
        inputCodigo.setAttribute('autocomplete', 'off');
        inputCodigo.setAttribute('disabled', 'disabled');

        formularioPartoEncontrado.appendChild(labelCodigo);
        formularioPartoEncontrado.appendChild(inputCodigo);

        // Número de partos
        const labelPartoNumero = document.createElement('label');
        labelPartoNumero.textContent = 'Parto No.:';
        labelPartoNumero.setAttribute('for', 'inputPartoNumero');

        const inputPartoNumero = document.createElement('input');
        inputPartoNumero.value = ((request.result.partos.length) + 1);
        inputPartoNumero.setAttribute('disabled', 'disabled');
        inputPartoNumero.setAttribute('id', 'inputPartoNumero');
        inputPartoNumero.setAttribute('type', 'number');
        inputPartoNumero.setAttribute('name', 'inputPartoNumero');
        inputPartoNumero.setAttribute('min', '0');
        inputPartoNumero.setAttribute('max', '60');

        formularioPartoEncontrado.appendChild(labelPartoNumero);
        formularioPartoEncontrado.appendChild(inputPartoNumero);

        // Fecha de parto
        const labelPartoFecha = document.createElement('label');
        labelPartoFecha.textContent = 'Parto fecha:';
        labelPartoFecha.setAttribute('for', 'inputPartoFecha');

        const datePartoFecha = document.createElement('input');
        datePartoFecha.setAttribute('id', 'datePartoFecha');
        datePartoFecha.setAttribute('type', 'date');
        datePartoFecha.setAttribute('name', 'datePartoFecha');

        formularioPartoEncontrado.appendChild(labelPartoFecha);
        formularioPartoEncontrado.appendChild(datePartoFecha);

        // Total Gazapos
        const labelTotalGazapos = document.createElement('label');
        labelTotalGazapos.textContent = 'Total Gazapos:';
        labelTotalGazapos.setAttribute('for', 'inputTotalGazapos');

        const inputTotalGazapos = document.createElement('input');
        inputTotalGazapos.setAttribute('id', 'inputTotalGazapos');
        inputTotalGazapos.setAttribute('type', 'number');
        inputTotalGazapos.setAttribute('name', 'inputTotalGazapos');
        inputTotalGazapos.setAttribute('min', '0');
        inputTotalGazapos.setAttribute('max', '15');

        formularioPartoEncontrado.appendChild(labelTotalGazapos);
        formularioPartoEncontrado.appendChild(inputTotalGazapos);

        // Total gazapos machos
        const labelGazaposMachos = document.createElement('label');
        labelGazaposMachos.textContent = 'G. Machos:';
        labelGazaposMachos.setAttribute('for', 'inputGazaposMachos');

        const inputGazaposMachos = document.createElement('input');
        inputGazaposMachos.setAttribute('id', 'inputGazaposMachos');
        inputGazaposMachos.setAttribute('type', 'number');
        inputGazaposMachos.setAttribute('name', 'inputGazaposMachos');
        inputGazaposMachos.setAttribute('min', '0');
        inputGazaposMachos.setAttribute('max', '15');

        formularioPartoEncontrado.appendChild(labelGazaposMachos);
        formularioPartoEncontrado.appendChild(inputGazaposMachos);

        // Total gazapos hembras
        const labelGazaposHembras = document.createElement('label');
        labelGazaposHembras.textContent = 'G. Hembras:';
        labelGazaposHembras.setAttribute('for', 'inputGazaposHembras');

        const inputGazaposHembras = document.createElement('input');
        inputGazaposHembras.setAttribute('id', 'inputGazaposHembras');
        inputGazaposHembras.setAttribute('type', 'number');
        inputGazaposHembras.setAttribute('name', 'inputGazaposHembras');
        inputGazaposHembras.setAttribute('min', '0');
        inputGazaposHembras.setAttribute('max', '15');

        formularioPartoEncontrado.appendChild(labelGazaposHembras);
        formularioPartoEncontrado.appendChild(inputGazaposHembras);

        // Total gazapos fallecidos
        const labelGazaposFallecidos = document.createElement('label');
        labelGazaposFallecidos.textContent = 'G. Fallecidos:';
        labelGazaposFallecidos.setAttribute('for', 'inputGazaposFallecidos');

        const inputGazaposFallecidos = document.createElement('input');
        inputGazaposFallecidos.setAttribute('id', 'inputGazaposFallecidos');
        inputGazaposFallecidos.setAttribute('type', 'number');
        inputGazaposFallecidos.setAttribute('name', 'inputGazaposFallecidos');
        inputGazaposFallecidos.setAttribute('min', '0');
        inputGazaposFallecidos.setAttribute('max', '15');

        formularioPartoEncontrado.appendChild(labelGazaposFallecidos);
        formularioPartoEncontrado.appendChild(inputGazaposFallecidos);

        // Botón agregar nuevo parto
        const buttonAgregarParto = document.createElement('button');
        buttonAgregarParto.textContent = 'Agregar';
        buttonAgregarParto.setAttribute('name', 'buttonAgregarParto');
        buttonAgregarParto.setAttribute('data-action', 'AgregarParto');
        buttonAgregarParto.dataset.type = 'AgregarParto';
        buttonAgregarParto.dataset.key = dataConejo.codigo;

        formularioPartoEncontrado.appendChild(buttonAgregarParto);

        // Append Generales (Mostrar toda la data)
        fragment.appendChild(formularioPartoEncontrado);
        divPartoEncontrado.appendChild(fragment);

        // Evento de escucha para agregar parto
        // ------------------------------------------------------------------------------------------
        formularioPartoEncontrado.addEventListener('submit', (event) => {
          event.preventDefault();

          const CPartoNumero = formularioPartoEncontrado.inputPartoNumero.value;
          const CPartoFecha = formularioPartoEncontrado.datePartoFecha.value;
          const CPartoTotalGazapos = formularioPartoEncontrado.inputTotalGazapos.value;
          const CPartoGazaposMachos = formularioPartoEncontrado.inputGazaposMachos.value;
          const CPartoGazaposHembras = formularioPartoEncontrado.inputGazaposHembras.value;
          const CPartoGazaposFallecidos = formularioPartoEncontrado.inputGazaposFallecidos.value;

          const conejoParto = {
            numero: CPartoNumero,
            fecha: CPartoFecha,
            gazapos: CPartoTotalGazapos,
            machos: CPartoGazaposMachos,
            hembras: CPartoGazaposHembras,
            fallecidos: CPartoGazaposFallecidos,
          };

          dataConejo.partos.push(conejoParto);

          const transactionAgregarParto = dataBase.transaction(['conejos'], 'readwrite');
          const objectStoreAgregarParto = transactionAgregarParto.objectStore('conejos');
          const requestAgregarParto = objectStoreAgregarParto.put(dataConejo);

          requestAgregarParto.onsuccess = (() => {
            transactionAgregarParto.oncomplete = (() => {
              console.log(`conejo codigo: ${request.result.codigo}, monta agregada en la bd`);
              formularioPartoEncontrado.textContent = '';
              formularioBuscarPartos.inputBuscarPartos.focus();
            });
          });

          requestAgregarParto.onerror = ((error) => {
            console.log('Error', error);
          });
        });
        // ------------------------------------------------------------------------------------------
      }
    });
  });

  request.onerror = ((error) => {
    console.log('Error', error);
  });
}
// ---------------------------------------------------------------------------------------------

// 4.- FUNCIÓN QUE BUSCA, ACTUALIZA Y ELIMINA UN CONEJO EN LA BASE DE DATOS.
//     NOTA: - Incluye evento de escucha botones actualizar y eliminar.
//           - En el caso de las montas y partos, solo actualiza el último registro.
// ---------------------------------------------------------------------------------------------
function buscarConejo(codigoBuscar) {
  errores = [];
  pError.textContent = '';
  containerError.classList.remove('container-error-visible__buscar');
  divDataEncontrada.textContent = '';

  const transaction = dataBase.transaction(['conejos'], 'readwrite');
  const objectStore = transaction.objectStore('conejos');
  const request = objectStore.get(codigoBuscar);
  const fragment = document.createDocumentFragment();
  let dataConejoEncontrado;
  let dataConejoActualizar;

  request.onsuccess = (() => {
    transaction.oncomplete = (() => {
      if (request.result === undefined) {
        errores.push(`Error: código ${codigoBuscar}, no existe en la BD.`);
      }

      if (errores.length > 0) {
        containerError.classList.add('container-error-visible__buscar');
        pError.textContent = '';
        pError.innerHTML = errores.join(', ');
      } else {
        // Variables con toda la data del conejo encontrado
        // -------------------------------------------------------------------------------------------------------------
        // dataConejoEncontrado: Solo como respaldo de la data encontrada en la base de datos sin alterar
        dataConejoEncontrado = request.result;
        // dataConejoActualizar: Variable que usaremos para actualizar los cambios de data a actualizar
        dataConejoActualizar = dataConejoEncontrado;
        // -------------------------------------------------------------------------------------------------------------

        // formulario que contendrá la data encontrada
        const formularioDataEncontrada = document.createElement('form');
        formularioDataEncontrada.setAttribute('id', 'formularioDataEncontrada');
        formularioDataEncontrada.setAttribute('autocomplete', 'off');
        formularioDataEncontrada.classList.add('container-buscar__container__formularioDataEncontrada__formularioDataEncontrada');

        // input código
        const labelCodigo = document.createElement('label');
        labelCodigo.textContent = 'Código:';
        labelCodigo.setAttribute('for', 'inputCodigo');

        const inputCodigo = document.createElement('input');
        inputCodigo.value = request.result.codigo;
        inputCodigo.setAttribute('id', 'inputCodigo');
        inputCodigo.setAttribute('name', 'inputCodigo');
        inputCodigo.setAttribute('type', 'text');
        inputCodigo.setAttribute('minlength', '1');
        inputCodigo.setAttribute('maxlength', '3');
        inputCodigo.setAttribute('disabled', 'disabled');

        formularioDataEncontrada.appendChild(labelCodigo);
        formularioDataEncontrada.appendChild(inputCodigo);

        // estado
        const LabelEstado = document.createElement('label');
        LabelEstado.textContent = 'Estado:';
        LabelEstado.setAttribute('for', 'selectEstado');

        const selectEstado = document.createElement('select');
        selectEstado.setAttribute('id', 'selectEstado');
        selectEstado.setAttribute('name', 'selectEstado');

        if (request.result.estado === true) {
          const selectEstadoOption1 = document.createElement('option');
          selectEstadoOption1.textContent = 'Activo';
          selectEstadoOption1.setAttribute('value', true);
          selectEstadoOption1.setAttribute('selected', 'selected');

          const selectEstadoOption2 = document.createElement('option');
          selectEstadoOption2.textContent = 'Inactivo';
          selectEstadoOption2.setAttribute('value', false);

          selectEstado.appendChild(selectEstadoOption1);
          selectEstado.appendChild(selectEstadoOption2);
        } else if (request.result.estado === false) {
          const selectEstadoOption1 = document.createElement('option');
          selectEstadoOption1.textContent = 'Activo';
          selectEstadoOption1.setAttribute('value', true);

          const selectEstadoOption2 = document.createElement('option');
          selectEstadoOption2.textContent = 'Inactivo';
          selectEstadoOption2.setAttribute('value', false);
          selectEstadoOption2.setAttribute('selected', 'selected');

          selectEstado.appendChild(selectEstadoOption1);
          selectEstado.appendChild(selectEstadoOption2);
        }

        formularioDataEncontrada.appendChild(LabelEstado);
        formularioDataEncontrada.appendChild(selectEstado);

        // Sexo
        const labelSexo = document.createElement('label');
        labelSexo.textContent = 'Sexo:';
        labelSexo.setAttribute('for', 'selectSexo');

        const selectSexo = document.createElement('select');
        selectSexo.setAttribute('id', 'selectSexo');
        selectSexo.setAttribute('name', 'selectSexo');

        if (request.result.sexo === 'Macho') {
          const selectSexoOption1 = document.createElement('option');
          selectSexoOption1.textContent = request.result.sexo;
          selectSexoOption1.setAttribute('value', request.result.sexo);
          selectSexoOption1.setAttribute('selected', 'selected');

          const selectSexoOption2 = document.createElement('option');
          selectSexoOption2.textContent = 'Hembra';
          selectSexoOption2.setAttribute('value', 'Hembra');

          selectSexo.appendChild(selectSexoOption1);
          selectSexo.appendChild(selectSexoOption2);
        } else if (request.result.sexo === 'Hembra') {
          const selectSexoOption1 = document.createElement('option');
          selectSexoOption1.textContent = request.result.sexo;
          selectSexoOption1.setAttribute('value', request.result.sexo);
          selectSexoOption1.setAttribute('selected', 'selected');

          const selectSexoOption2 = document.createElement('option');
          selectSexoOption2.textContent = 'Macho';
          selectSexoOption2.setAttribute('value', 'Macho');

          selectSexo.appendChild(selectSexoOption1);
          selectSexo.appendChild(selectSexoOption2);
        }

        formularioDataEncontrada.appendChild(labelSexo);
        formularioDataEncontrada.appendChild(selectSexo);

        // Razas
        const labelRaza = document.createElement('label');
        labelRaza.textContent = 'Raza:';
        labelRaza.setAttribute('for', 'selectRaza');

        const selectRaza = document.createElement('select');
        selectRaza.setAttribute('id', 'selectRaza');
        selectRaza.setAttribute('name', 'selectRaza');

        const selectRazaOption1 = document.createElement('option');
        selectRazaOption1.textContent = request.result.raza;
        selectRazaOption1.setAttribute('value', request.result.raza);
        selectRazaOption1.setAttribute('selected', 'selected');

        const selectRazaOption2 = document.createElement('option');
        selectRazaOption2.setAttribute('value', 'Azul de viena');
        selectRazaOption2.textContent = 'Azul de viena';

        const selectRazaOption3 = document.createElement('option');
        selectRazaOption3.setAttribute('value', 'Cabeza de león');
        selectRazaOption3.textContent = 'Cabeza de león';

        const selectRazaOption4 = document.createElement('option');
        selectRazaOption4.setAttribute('value', 'Californiano');
        selectRazaOption4.textContent = 'Californiano';

        const selectRazaOption5 = document.createElement('option');
        selectRazaOption5.setAttribute('value', 'Gigante de Flanders');
        selectRazaOption5.textContent = 'Gigante de Flanders';

        const selectRazaOption6 = document.createElement('option');
        selectRazaOption6.setAttribute('value', 'Mariposa');
        selectRazaOption6.textContent = 'Mariposa';

        const selectRazaOption7 = document.createElement('option');
        selectRazaOption7.setAttribute('value', 'Mini Rex');
        selectRazaOption7.textContent = 'Mini Rex';

        const selectRazaOption8 = document.createElement('option');
        selectRazaOption8.setAttribute('value', 'Nueva Zelanda');
        selectRazaOption8.textContent = 'Nueva Zelanda';

        formularioDataEncontrada.appendChild(labelRaza);
        selectRaza.appendChild(selectRazaOption1);
        selectRaza.appendChild(selectRazaOption2);
        selectRaza.appendChild(selectRazaOption3);
        selectRaza.appendChild(selectRazaOption4);
        selectRaza.appendChild(selectRazaOption5);
        selectRaza.appendChild(selectRazaOption6);
        selectRaza.appendChild(selectRazaOption7);
        selectRaza.appendChild(selectRazaOption8);
        formularioDataEncontrada.appendChild(selectRaza);

        // Líneas
        const labelLinea = document.createElement('label');
        labelLinea.textContent = 'Línea:';
        labelLinea.setAttribute('for', 'selectLineas');

        const selectLineas = document.createElement('select');
        selectLineas.setAttribute('id', 'selectLineas');
        selectLineas.setAttribute('name', 'selectLineas');

        const selectLineasOption1 = document.createElement('option');
        selectLineasOption1.textContent = request.result.linea;
        selectLineasOption1.setAttribute('value', request.result.linea);
        selectLineasOption1.setAttribute('selected', 'selected');

        const selectLineasOption2 = document.createElement('option');
        selectLineasOption2.setAttribute('value', 'Melendero');
        selectLineasOption2.textContent = 'Melendero';

        formularioDataEncontrada.appendChild(labelLinea);
        selectLineas.appendChild(selectLineasOption1);
        selectLineas.appendChild(selectLineasOption2);
        formularioDataEncontrada.appendChild(selectLineas);

        // Génotipo
        const labelGenotipo = document.createElement('label');
        labelGenotipo.textContent = 'Génotipo:';
        labelGenotipo.setAttribute('for', 'selectGenotipo');

        const selectGenotipo = document.createElement('select');
        selectGenotipo.setAttribute('id', 'selectGenotipo');
        selectGenotipo.setAttribute('name', 'selectGenotipo');

        const selectGenotipoOption1 = document.createElement('option');
        selectGenotipoOption1.textContent = request.result.genotipo;
        selectGenotipoOption1.setAttribute('value', request.result.genotipo);
        selectGenotipoOption1.setAttribute('selected', 'selected');

        const selectGenotipoOption2 = document.createElement('option');
        selectGenotipoOption2.setAttribute('value', '1-3');
        selectGenotipoOption2.textContent = '1-3';

        const selectGenotipoOption3 = document.createElement('option');
        selectGenotipoOption3.setAttribute('value', '2-2');
        selectGenotipoOption3.textContent = '2-2';

        const selectGenotipoOption4 = document.createElement('option');
        selectGenotipoOption4.setAttribute('value', '3-1');
        selectGenotipoOption4.textContent = '3-1';

        formularioDataEncontrada.appendChild(labelGenotipo);
        selectGenotipo.appendChild(selectGenotipoOption1);
        selectGenotipo.appendChild(selectGenotipoOption2);
        selectGenotipo.appendChild(selectGenotipoOption3);
        selectGenotipo.appendChild(selectGenotipoOption4);
        formularioDataEncontrada.appendChild(selectGenotipo);

        // Fénotipo Dominante
        const labelFenotipoD = document.createElement('label');
        labelFenotipoD.textContent = 'Fénotipo D:';
        labelFenotipoD.setAttribute('for', 'inputFenotipoD');

        const inputFenotipoD = document.createElement('input');
        inputFenotipoD.value = request.result.fenotipoD;
        inputFenotipoD.setAttribute('id', 'inputFenotipoD');
        inputFenotipoD.setAttribute('type', 'text');
        inputFenotipoD.setAttribute('name', 'inputFenotipoD');
        inputFenotipoD.setAttribute('minlength', '1');
        inputFenotipoD.setAttribute('maxlength', '50');

        formularioDataEncontrada.appendChild(labelFenotipoD);
        formularioDataEncontrada.appendChild(inputFenotipoD);

        // Fénotipo Rececivo
        const labelFenotipoR = document.createElement('label');
        labelFenotipoR.textContent = 'Fénotipo R:';
        labelFenotipoR.setAttribute('for', 'inputFenotipoR');

        const inputFenotipoR = document.createElement('input');
        inputFenotipoR.value = request.result.fenotipoR;
        inputFenotipoR.setAttribute('id', 'inputFenotipoR');
        inputFenotipoR.setAttribute('type', 'text');
        inputFenotipoR.setAttribute('name', 'inputFenotipoR');
        inputFenotipoR.setAttribute('minlength', '1');
        inputFenotipoR.setAttribute('maxlength', '50');

        formularioDataEncontrada.appendChild(labelFenotipoR);
        formularioDataEncontrada.appendChild(inputFenotipoR);

        // Nacimiento
        const labelNacimiento = document.createElement('label');
        labelNacimiento.textContent = 'Nacimiento:';
        labelNacimiento.setAttribute('for', 'dateNacimiento');

        const dateNacimiento = document.createElement('input');
        dateNacimiento.value = request.result.nacimiento;
        dateNacimiento.setAttribute('id', 'dateNacimiento');
        dateNacimiento.setAttribute('type', 'date');
        dateNacimiento.setAttribute('name', 'dateNacimiento');

        formularioDataEncontrada.appendChild(labelNacimiento);
        formularioDataEncontrada.appendChild(dateNacimiento);

        // Peso
        const labelPeso = document.createElement('label');
        labelPeso.textContent = 'Peso (Kg):';
        labelPeso.setAttribute('for', 'inputPeso');

        const inputPeso = document.createElement('input');
        inputPeso.value = request.result.peso;
        inputPeso.setAttribute('id', 'inputPeso');
        inputPeso.setAttribute('type', 'text');
        inputPeso.setAttribute('name', 'inputPeso');

        formularioDataEncontrada.appendChild(labelPeso);
        formularioDataEncontrada.appendChild(inputPeso);

        // Diferencias de Machos y Hembras (Montas y Partos)
        if ((request.result.sexo === 'Macho') && (request.result.montas.length > 0)) {
          // Montas Número
          const labelMontaNumero = document.createElement('label');
          labelMontaNumero.textContent = 'Monta No.:';
          labelMontaNumero.setAttribute('for', 'inputMontaNumero');

          const inputMontaNumero = document.createElement('input');
          inputMontaNumero.value = request.result.montas[((request.result.montas.length) - 1)].numero;
          inputMontaNumero.setAttribute('disabled', 'disabled');
          inputMontaNumero.setAttribute('id', 'inputMontaNumero');
          inputMontaNumero.setAttribute('type', 'number');
          inputMontaNumero.setAttribute('name', 'inputMontaNumero');
          inputMontaNumero.setAttribute('min', '0');
          inputMontaNumero.setAttribute('max', '60');

          formularioDataEncontrada.appendChild(labelMontaNumero);
          formularioDataEncontrada.appendChild(inputMontaNumero);

          // Monta Fecha
          const labelMontaFecha = document.createElement('label');
          labelMontaFecha.textContent = 'Monta Fecha:';
          labelMontaFecha.setAttribute('for', 'dateMontaFecha');

          const dateMontaFecha = document.createElement('input');
          dateMontaFecha.value = request.result.montas[((request.result.montas.length) - 1)].fecha;
          dateMontaFecha.setAttribute('id', 'dateMontaFecha');
          dateMontaFecha.setAttribute('type', 'date');
          dateMontaFecha.setAttribute('name', 'dateMontaFecha');

          formularioDataEncontrada.appendChild(labelMontaFecha);
          formularioDataEncontrada.appendChild(dateMontaFecha);

          // Monta Efectividad
          const labelMontaEfectividad = document.createElement('label');
          labelMontaEfectividad.textContent = 'Monta Efect. (%):';
          labelMontaEfectividad.setAttribute('for', 'inputMontaEfectividad');

          const inputMontaEfectividad = document.createElement('input');
          inputMontaEfectividad.value = request.result.montas[((request.result.montas.length) - 1)].efectividad;
          inputMontaEfectividad.setAttribute('id', 'inputMontaEfectividad');
          inputMontaEfectividad.setAttribute('type', 'number');
          inputMontaEfectividad.setAttribute('name', 'inputMontaEfectividad');
          inputMontaEfectividad.setAttribute('min', '0');
          inputMontaEfectividad.setAttribute('max', '100');

          formularioDataEncontrada.appendChild(labelMontaEfectividad);
          formularioDataEncontrada.appendChild(inputMontaEfectividad);
        } else if ((request.result.sexo === 'Hembra') && (request.result.partos.length > 0)) {
          // Número de partos
          const labelPartoNumero = document.createElement('label');
          labelPartoNumero.textContent = 'Parto No.:';
          labelPartoNumero.setAttribute('for', 'inputPartoNumero');

          const inputPartoNumero = document.createElement('input');
          inputPartoNumero.value = request.result.partos[((request.result.partos.length) - 1)].numero;
          inputPartoNumero.setAttribute('id', 'inputPartoNumero');
          inputPartoNumero.setAttribute('name', 'inputPartoNumero');
          inputPartoNumero.setAttribute('type', 'number');
          inputPartoNumero.setAttribute('min', '0');
          inputPartoNumero.setAttribute('max', '60');
          inputPartoNumero.setAttribute('disabled', 'disabled');
          formularioDataEncontrada.appendChild(labelPartoNumero);
          formularioDataEncontrada.appendChild(inputPartoNumero);

          // Fecha de parto
          const labelPartoFecha = document.createElement('label');
          labelPartoFecha.textContent = 'Parto fecha:';
          labelPartoFecha.setAttribute('for', 'datePartoFecha');

          const datePartoFecha = document.createElement('input');
          datePartoFecha.value = request.result.partos[((request.result.partos.length) - 1)].fecha;
          datePartoFecha.setAttribute('id', 'datePartoFecha');
          datePartoFecha.setAttribute('type', 'date');
          datePartoFecha.setAttribute('name', 'datePartoFecha');
          formularioDataEncontrada.appendChild(labelPartoFecha);
          formularioDataEncontrada.appendChild(datePartoFecha);

          // Total Gazapos
          const labelTotalGazapos = document.createElement('label');
          labelTotalGazapos.textContent = 'Total Gazapos:';
          labelTotalGazapos.setAttribute('for', 'inputTotalGazapos');

          const inputTotalGazapos = document.createElement('input');
          inputTotalGazapos.value = request.result.partos[((request.result.partos.length) - 1)].gazapos;
          inputTotalGazapos.setAttribute('id', 'inputTotalGazapos');
          inputTotalGazapos.setAttribute('type', 'number');
          inputTotalGazapos.setAttribute('name', 'inputTotalGazapos');
          inputTotalGazapos.setAttribute('min', '0');
          inputTotalGazapos.setAttribute('max', '15');
          formularioDataEncontrada.appendChild(labelTotalGazapos);
          formularioDataEncontrada.appendChild(inputTotalGazapos);

          // Total gazapos machos
          const labelGazaposMachos = document.createElement('label');
          labelGazaposMachos.textContent = 'G. Machos:';
          labelGazaposMachos.setAttribute('for', 'inputGazaposMachos');

          const inputGazaposMachos = document.createElement('input');
          inputGazaposMachos.value = request.result.partos[((request.result.partos.length) - 1)].machos;
          inputGazaposMachos.setAttribute('id', 'inputGazaposMachos');
          inputGazaposMachos.setAttribute('type', 'number');
          inputGazaposMachos.setAttribute('name', 'inputGazaposMachos');
          inputGazaposMachos.setAttribute('min', '0');
          inputGazaposMachos.setAttribute('max', '15');

          formularioDataEncontrada.appendChild(labelGazaposMachos);
          formularioDataEncontrada.appendChild(inputGazaposMachos);

          // Total gazapos hembras
          const labelGazaposHembras = document.createElement('label');
          labelGazaposHembras.textContent = 'G. Hembras:';
          labelGazaposHembras.setAttribute('for', 'inputGazaposHembras');

          const inputGazaposHembras = document.createElement('input');
          inputGazaposHembras.value = request.result.partos[((request.result.partos.length) - 1)].hembras;
          inputGazaposHembras.setAttribute('id', 'inputGazaposHembras');
          inputGazaposHembras.setAttribute('type', 'number');
          inputGazaposHembras.setAttribute('name', 'inputGazaposHembras');
          inputGazaposHembras.setAttribute('min', '0');
          inputGazaposHembras.setAttribute('max', '15');

          formularioDataEncontrada.appendChild(labelGazaposHembras);
          formularioDataEncontrada.appendChild(inputGazaposHembras);

          // Total gazapos fallecidos
          const labelGazaposFallecidos = document.createElement('label');
          labelGazaposFallecidos.textContent = 'G. Fallecidos:';
          labelGazaposFallecidos.setAttribute('for', 'inputGazaposFallecidos');

          const inputGazaposFallecidos = document.createElement('input');
          inputGazaposFallecidos.value = request.result.partos[((request.result.partos.length) - 1)].fallecidos;
          inputGazaposFallecidos.setAttribute('id', 'inputGazaposFallecidos');
          inputGazaposFallecidos.setAttribute('type', 'number');
          inputGazaposFallecidos.setAttribute('name', 'inputGazaposFallecidos');
          inputGazaposFallecidos.setAttribute('min', '0');
          inputGazaposFallecidos.setAttribute('max', '15');

          formularioDataEncontrada.appendChild(labelGazaposFallecidos);
          formularioDataEncontrada.appendChild(inputGazaposFallecidos);
        }

        // Botón eliminar
        const buttonEliminar = document.createElement('button');
        buttonEliminar.textContent = 'Eliminar';
        buttonEliminar.setAttribute('id', 'buttonEliminar');
        buttonEliminar.setAttribute('name', 'buttonEliminar');
        buttonEliminar.setAttribute('data-action', 'Eliminar');
        buttonEliminar.dataset.type = 'Eliminar';
        buttonEliminar.dataset.key = request.result.codigo;

        formularioDataEncontrada.appendChild(buttonEliminar);

        // Botón actualizar
        const buttonActualizar = document.createElement('button');
        buttonActualizar.textContent = 'Actualizar';
        buttonActualizar.setAttribute('name', 'buttonActualizar');
        buttonActualizar.setAttribute('data-action', 'Actualizar');
        buttonActualizar.dataset.type = 'Actualizar';
        buttonActualizar.dataset.key = request.result.codigo;

        formularioDataEncontrada.appendChild(buttonActualizar);

        // Mostrar toda la data encontrada
        fragment.appendChild(formularioDataEncontrada);
        divDataEncontrada.appendChild(fragment);

        // Evento de escucha para eliminar conejo
        // ------------------------------------------------------------------------------------------
        formularioDataEncontrada.buttonEliminar.addEventListener('click', (event) => {
          event.preventDefault();
          const codigoEliminar = request.result.codigo;

          const transactionEliminar = dataBase.transaction(['conejos'], 'readwrite');
          const objectStoreElininar = transactionEliminar.objectStore('conejos');
          const requestEliminar = objectStoreElininar.delete(codigoEliminar);

          requestEliminar.onsuccess = (() => {
            transactionEliminar.oncomplete = (() => {
              console.log(`conejo codigo: ${codigoEliminar}, eliminado de la bd`);
              formularioDataEncontrada.textContent = '';
              formularioBuscar.inputBuscar.focus();
            });
          });

          requestEliminar.onerror = (() => {
            console.log(`conejo codigo: ${codigoEliminar}, NO eliminado de la bd`);
          });
        });
        // ------------------------------------------------------------------------------------------

        // Evento de escucha para actualizar conejo
        // ------------------------------------------------------------------------------------------
        formularioDataEncontrada.buttonActualizar.addEventListener('click', (event) => {
          event.preventDefault();
          const codigo = dataConejoEncontrado.codigo;

          // En caso de requerir un cambio de sexo (Esto cambia la estructura del objeto)
          // NOTA: En caso de ser Macho se pierden las montas y en las Hembras los partos
          // ----------------------------------------------------------------------------------------
          if ((dataConejoEncontrado.sexo) !== (formularioDataEncontrada.selectSexo.value)) {
            const transactionEliminar = dataBase.transaction(['conejos'], 'readwrite');
            const objectStoreEliminar = transactionEliminar.objectStore('conejos');
            const requestEliminar = objectStoreEliminar.delete(codigo);

            requestEliminar.onsuccess = (() => {
              transactionEliminar.oncomplete = (() => {
                const Ccodigo = codigo;
                const Csexo = formularioDataEncontrada.selectSexo.value;
                const Craza = formularioDataEncontrada.selectRaza.value;
                const Clinea = formularioDataEncontrada.selectLineas.value;
                const Cgenotipo = formularioDataEncontrada.selectGenotipo.value;
                const CfenotipoD = formularioDataEncontrada.inputFenotipoD.value;
                const CfenotipoR = formularioDataEncontrada.inputFenotipoR.value;
                const Cnacimiento = formularioDataEncontrada.dateNacimiento.value;
                const Cpeso = formularioDataEncontrada.inputPeso.value;

                agregarConejo(Ccodigo, Csexo, Craza, Clinea, Cgenotipo, CfenotipoD, CfenotipoR, Cnacimiento, Cpeso);

                formularioDataEncontrada.reset();
                divDataEncontrada.textContent = '';
                formularioBuscar.inputBuscar.focus();
              });
            });
          }
          // -----------------------------------------------------------------------------------------

          // En caso de que el sexo no cambie
          // -----------------------------------------------------------------------------------------
          if ((dataConejoEncontrado.sexo) === (formularioDataEncontrada.selectSexo.value)) {
            // Asignación de nuevos valores a ser actualizados (Machos y Hembras).
            dataConejoActualizar.sexo = formularioDataEncontrada.selectSexo.value;
            dataConejoActualizar.raza = formularioDataEncontrada.selectRaza.value;
            dataConejoActualizar.linea = formularioDataEncontrada.selectLineas.value;
            dataConejoActualizar.genotipo = formularioDataEncontrada.selectGenotipo.value;
            dataConejoActualizar.fenotipoD = formularioDataEncontrada.inputFenotipoD.value;
            dataConejoActualizar.fenotipoR = formularioDataEncontrada.inputFenotipoR.value;
            dataConejoActualizar.nacimiento = formularioDataEncontrada.dateNacimiento.value;
            dataConejoActualizar.peso = formularioDataEncontrada.inputPeso.value;

            if (formularioDataEncontrada.selectEstado.value === 'true') {
              dataConejoActualizar.estado = true;
            } else if (formularioDataEncontrada.selectEstado.value === 'false') {
              dataConejoActualizar.estado = false;
            }

            // Asignación de nuevos valores a ser actualizados (Solo Machos).
            if ((formularioDataEncontrada.selectSexo.value === 'Macho') && (request.result.montas.length > 0)) {
              dataConejoActualizar.montas[((request.result.montas.length) - 1)].numero = formularioDataEncontrada.inputMontaNumero.value;
              dataConejoActualizar.montas[((request.result.montas.length) - 1)].fecha = formularioDataEncontrada.dateMontaFecha.value;
              dataConejoActualizar.montas[((request.result.montas.length) - 1)].efectividad = formularioDataEncontrada.inputMontaEfectividad.value;
            }

            // Asignación de nuevos valores a ser actualizados (Solo Hembras).
            if ((formularioDataEncontrada.selectSexo.value === 'Hembra') && (request.result.partos.length > 0)) {
              dataConejoActualizar.partos[((request.result.partos.length) - 1)].numero = formularioDataEncontrada.inputPartoNumero.value;
              dataConejoActualizar.partos[((request.result.partos.length) - 1)].fecha = formularioDataEncontrada.datePartoFecha.value;
              dataConejoActualizar.partos[((request.result.partos.length) - 1)].gazapos = formularioDataEncontrada.inputTotalGazapos.value;
              dataConejoActualizar.partos[((request.result.partos.length) - 1)].machos = formularioDataEncontrada.inputGazaposMachos.value;
              dataConejoActualizar.partos[((request.result.partos.length) - 1)].hembras = formularioDataEncontrada.inputGazaposHembras.value;
              dataConejoActualizar.partos[((request.result.partos.length) - 1)].fallecidos = formularioDataEncontrada.inputGazaposFallecidos.value;
            }

            const transactionActualizar = dataBase.transaction(['conejos'], 'readwrite');
            const objectStoreActualizar = transactionActualizar.objectStore('conejos');
            const requestActualizar = objectStoreActualizar.put(dataConejoActualizar);

            requestActualizar.onsuccess = (() => {
              transactionActualizar.oncomplete = (() => {
                console.log(`conejo codigo: ${codigo}, actualizado en la bd`);
                formularioDataEncontrada.textContent = '';
                formularioBuscar.inputBuscar.focus();
              });
            });

            requestActualizar.onerror = (() => {
              console.log(`conejo codigo: ${codigo}, NO fue actualizado en la bd`);
              formularioDataEncontrada.textContent = '';
              formularioBuscar.inputBuscar.focus();
            });
          }
          // -----------------------------------------------------------------------------------------
        });
      }
    });
  });

  request.onerror = ((error) => {
    errores.push('Error: código no exite en la BD');
    console.log('Error:', error);

    containerError.classList.add('container-error-visible');
    pError.textContent = '';
    pError.innerHTML = errores.join(', ');

    formularioBuscar.inputBuscar.focus();
  });
}
// ---------------------------------------------------------------------------------------------

// 5.- FUNCIÓN QUE MUESTRA TODOS LOS CONEJOS ALMACENADOS EN LA BASE DE DATOS.
//     NOTA: No tiene un evento de escucha, es llamada al abrir la base de datos en el
//           request.onsuccess, esto solo si entramos en la opción "Mostrar Conejos" del
//           menú principal. Tenemos que encontrarnos en (http://localhost:3000/mostrar.html).
// ---------------------------------------------------------------------------------------------
function mostrarConejos() {
  divContainerInformacionItems.textContent = '';
  errores = [];

  const transaction = dataBase.transaction(['conejos'], 'readonly');
  const objectStore = transaction.objectStore('conejos');
  const request = objectStore.openCursor();

  const fragment = document.createDocumentFragment();

  request.onsuccess = (() => {
    const cursor = request.result;

    if (cursor) {
      const codigoLabel = document.createElement('label');
      codigoLabel.textContent = 'Código:';
      fragment.appendChild(codigoLabel);
      const codigoValue = document.createElement('span');
      codigoValue.textContent = cursor.value.codigo;
      fragment.appendChild(codigoValue);

      if (cursor.value.estado === true) {
        const estadoLabel = document.createElement('label');
        estadoLabel.textContent = 'Estado:';
        fragment.appendChild(estadoLabel);
        const estadoValue = document.createElement('span');
        estadoValue.textContent = 'Activo';
        fragment.appendChild(estadoValue);
      } else if (cursor.value.estado === false) {
        const estadoLabel = document.createElement('label');
        estadoLabel.textContent = 'Estado:';
        fragment.appendChild(estadoLabel);
        const estadoValue = document.createElement('span');
        estadoValue.textContent = 'Inactivo';
        fragment.appendChild(estadoValue);
      }

      const sexoLabel = document.createElement('label');
      sexoLabel.textContent = 'Sexo:';
      fragment.appendChild(sexoLabel);
      const sexoValue = document.createElement('span');
      sexoValue.textContent = cursor.value.sexo;
      fragment.appendChild(sexoValue);

      const razaLabel = document.createElement('label');
      razaLabel.textContent = 'Raza:';
      fragment.appendChild(razaLabel);
      const razaValue = document.createElement('span');
      razaValue.textContent = cursor.value.raza;
      fragment.appendChild(razaValue);

      const lineaLabel = document.createElement('label');
      lineaLabel.textContent = 'Línea:';
      fragment.appendChild(lineaLabel);
      const lineaValue = document.createElement('span');
      lineaValue.textContent = cursor.value.linea;
      fragment.appendChild(lineaValue);

      const genotipoLabel = document.createElement('label');
      genotipoLabel.textContent = 'Génotipo:';
      fragment.appendChild(genotipoLabel);
      const genotipoValue = document.createElement('span');
      genotipoValue.textContent = cursor.value.genotipo;
      fragment.appendChild(genotipoValue);

      const fenotipoDLabel = document.createElement('label');
      fenotipoDLabel.textContent = 'Fénotipo D:';
      fragment.appendChild(fenotipoDLabel);
      const fenotipoDValue = document.createElement('span');
      fenotipoDValue.textContent = cursor.value.fenotipoD;
      fragment.appendChild(fenotipoDValue);

      const fenotipoRLabel = document.createElement('label');
      fenotipoRLabel.textContent = 'Fénotipo R:';
      fragment.appendChild(fenotipoRLabel);
      const fenotipoRValue = document.createElement('span');
      fenotipoRValue.textContent = cursor.value.fenotipoR;
      fragment.appendChild(fenotipoRValue);

      const nacimientoLabel = document.createElement('label');
      nacimientoLabel.textContent = 'Nacimiento:';
      fragment.appendChild(nacimientoLabel);
      const nacimientoValue = document.createElement('span');
      nacimientoValue.textContent = cursor.value.nacimiento;
      fragment.appendChild(nacimientoValue);

      const pesoLabel = document.createElement('label');
      pesoLabel.textContent = 'Peso:';
      fragment.appendChild(pesoLabel);
      const pesoValue = document.createElement('span');
      pesoValue.textContent = cursor.value.peso;
      fragment.appendChild(pesoValue);

      if ((cursor.value.sexo === 'Macho') && (cursor.value.montas.length > 0)) {
        const montaNoLabel = document.createElement('label');
        montaNoLabel.textContent = 'Monta No.:';
        fragment.appendChild(montaNoLabel);

        const montaNoValue = document.createElement('span');
        montaNoValue.textContent = cursor.value.montas[((cursor.value.montas.length) - 1)].numero;
        fragment.appendChild(montaNoValue);

        const montaFechaLabel = document.createElement('label');
        montaFechaLabel.textContent = 'Monta Fecha:';
        fragment.appendChild(montaFechaLabel);

        const montaFechaValue = document.createElement('span');
        montaFechaValue.textContent = cursor.value.montas[((cursor.value.montas.length) - 1)].fecha;
        fragment.appendChild(montaFechaValue);

        const montaEfectividadLabel = document.createElement('label');
        montaEfectividadLabel.textContent = 'Monta Efect.:';
        fragment.appendChild(montaEfectividadLabel);

        const montaEfectividadValue = document.createElement('span');
        montaEfectividadValue.textContent = cursor.value.montas[((cursor.value.montas.length) - 1)].efectividad;
        fragment.appendChild(montaEfectividadValue);
      }

      if ((cursor.value.sexo === 'Hembra') && (cursor.value.partos.length > 0)) {
        const partoNoLabel = document.createElement('label');
        partoNoLabel.textContent = 'Parto No.:';
        fragment.appendChild(partoNoLabel);
        const partoNoValue = document.createElement('span');
        partoNoValue.textContent = cursor.value.partos[((cursor.value.partos.length) - 1)].numero;
        fragment.appendChild(partoNoValue);

        const partoFechaLabel = document.createElement('label');
        partoFechaLabel.textContent = 'Parto Fecha:';
        fragment.appendChild(partoFechaLabel);
        const partoFechaValue = document.createElement('span');
        partoFechaValue.textContent = cursor.value.partos[((cursor.value.partos.length) - 1)].fecha;
        fragment.appendChild(partoFechaValue);

        const partoTotalGazaposLabel = document.createElement('label');
        partoTotalGazaposLabel.textContent = 'Total G.:';
        fragment.appendChild(partoTotalGazaposLabel);
        const partoTotalGazaposValue = document.createElement('span');
        partoTotalGazaposValue.textContent = cursor.value.partos[((cursor.value.partos.length) - 1)].gazapos;
        fragment.appendChild(partoTotalGazaposValue);

        const partoGazaposMachoLabel = document.createElement('label');
        partoGazaposMachoLabel.textContent = 'G. Machos:';
        fragment.appendChild(partoGazaposMachoLabel);
        const partoGazaposMachosValue = document.createElement('span');
        partoGazaposMachosValue.textContent = cursor.value.partos[((cursor.value.partos.length) - 1)].machos;
        fragment.appendChild(partoGazaposMachosValue);

        const partoGazaposHembrasLabel = document.createElement('label');
        partoGazaposHembrasLabel.textContent = 'G. Hembras:';
        fragment.appendChild(partoGazaposHembrasLabel);
        const partoGazaposhembrasValue = document.createElement('span');
        partoGazaposhembrasValue.textContent = cursor.value.partos[((cursor.value.partos.length) - 1)].hembras;
        fragment.appendChild(partoGazaposhembrasValue);

        const partoGazaposFallecidosLabel = document.createElement('label');
        partoGazaposFallecidosLabel.textContent = 'G. Fallecidos:';
        fragment.appendChild(partoGazaposFallecidosLabel);
        const partoGazaposFallecidosValue = document.createElement('span');
        partoGazaposFallecidosValue.textContent = cursor.value.partos[((cursor.value.partos.length) - 1)].fallecidos;
        fragment.appendChild(partoGazaposFallecidosValue);
      }

      cursor.continue();
    } else {
      divContainerInformacionItems.appendChild(fragment);
    }
  });

  request.onerror = ((eventError) => {
    errores.push('Error:', eventError);

    containerError.classList.add('container-error-visible');
    pError.textContent = '';
    pError.innerHTML = errores.join(', ');
  });
}
// ---------------------------------------------------------------------------------------------

// 6.- FUNCIÓN QUE MUESTRA LAS MONTAS DE UN CONEJO MACHO, EXISTENTES EN LA BASE DE DATOS.
//     NOTA: Busca el conejo por código y muestra las montas de tenerlas.
function mostrarMontas(codigoBuscar) {
  errores = [];
  pError.textContent = '';
  containerError.classList.remove('container-error-visible__mostrar-montas');
  mostrarDivMontasEncontradas.textContent = '';

  const transaction = dataBase.transaction(['conejos'], 'readonly');
  const objectStore = transaction.objectStore('conejos');
  const request = objectStore.get(codigoBuscar);

  request.onsuccess = (() => {
    transaction.oncomplete = (() => {
      if (request.result === undefined) {
        errores.push(`Error: código ${codigoBuscar}, no existe en la BD.`);
      } else if (request.result.sexo === 'Hembra') {
        errores.push(`Error: código ${request.result.codigo} sexo ${request.result.sexo}, macho requerido`);
      }

      if (errores.length > 0) {
        containerError.classList.add('container-error-visible__mostrar-montas');
        pError.textContent = '';
        pError.innerHTML = errores.join(', ');
      } else {
        const dataConejo = request.result;
        const dataMontas = request.result.montas;

        if (dataMontas.length <= 0) {
          errores.push(`El código: ${codigoBuscar}, no tiene montas`);
        }

        if (errores.length > 0) {
          containerError.classList.add('container-error-visible');
          pError.textContent = '';
          pError.innerHTML = errores.join(', ');
        } else {
          // fragmento de código
          const fragment = document.createDocumentFragment();

          // formulario
          const formularioMontasEncontradas = document.createElement('form');
          formularioMontasEncontradas.setAttribute('id', 'formulario-mostrarMontasEncontradas');
          formularioMontasEncontradas.classList.add('container-mostrarMontas__container-formulario-mostrarMontasEncontradas__formulario-mostrarMontasEncontradas');

          // Código
          const labelCodigo = document.createElement('label');
          labelCodigo.textContent = 'Código:';

          const spanCodigo = document.createElement('span');
          spanCodigo.textContent = dataConejo.codigo;

          formularioMontasEncontradas.appendChild(labelCodigo);
          formularioMontasEncontradas.appendChild(spanCodigo);

          // Bucle que recorre el arreglo "dataMontas"
          // --------------------------------------------------------------------------------------
          dataMontas.forEach((element) => {
            // Monta número
            const labelMontaNumero = document.createElement('label');
            labelMontaNumero.textContent = 'Monta No.:';

            const spanMontaNumero = document.createElement('span');
            spanMontaNumero.textContent = element.numero;

            formularioMontasEncontradas.appendChild(labelMontaNumero);
            formularioMontasEncontradas.appendChild(spanMontaNumero);

            // Monta fecha
            const labelMontaFecha = document.createElement('label');
            labelMontaFecha.textContent = 'Monta fecha:';

            const spanMontaFecha = document.createElement('span');
            spanMontaFecha.textContent = element.fecha;

            formularioMontasEncontradas.appendChild(labelMontaFecha);
            formularioMontasEncontradas.appendChild(spanMontaFecha);

            // Monta efectividad
            const labelMontaEfectividad = document.createElement('label');
            labelMontaEfectividad.textContent = 'Monta efectividad:';

            const spanMontaEfectividad = document.createElement('span');
            spanMontaEfectividad.textContent = element.efectividad;

            formularioMontasEncontradas.appendChild(labelMontaEfectividad);
            formularioMontasEncontradas.appendChild(spanMontaEfectividad);

            // Append Fragment
            fragment.appendChild(formularioMontasEncontradas);
          });
          // --------------------------------------------------------------------------------------

          // Append Generales (Mostrar los elementos en el contenedor)
          mostrarDivMontasEncontradas.appendChild(fragment);
        }
      }
    });
  });

  request.onerror = ((eventError) => {
    errores.push('Error:', eventError);

    containerError.classList.add('container-error-visible');
    pError.textContent = '';
    pError.innerHTML = errores.join(', ');
  });
}
// ---------------------------------------------------------------------------------------------

// 7.- FUNCIÓN QUE MUESTRA LOS PARTOS DE UN CONEJO HEMBRA, EXISTENTES EN LA BASE DE DATOS.
//     NOTA: Busca el conejo por código y muestra los partos de tenerlos.
function mostrarPartos(codigoBuscar) {
  errores = [];
  pError.textContent = '';
  containerError.classList.remove('container-error-visible__mostrar-partos');
  mostrarDivPartosEncontrados.textContent = '';

  const transaction = dataBase.transaction(['conejos'], 'readonly');
  const objectStore = transaction.objectStore('conejos');
  const request = objectStore.get(codigoBuscar);

  request.onsuccess = (() => {
    transaction.oncomplete = (() => {
      if (request.result === undefined) {
        errores.push(`Error: código ${codigoBuscar}, no existe en la BD.`);
      } else if (request.result.sexo === 'Macho') {
        errores.push(`Error: código ${request.result.codigo} sexo ${request.result.sexo}, Hembra requerido`);
      }

      if (errores.length > 0) {
        containerError.classList.add('container-error-visible__mostrar-partos');
        pError.textContent = '';
        pError.innerHTML = errores.join(', ');
      } else {
        const dataConejo = request.result;
        const dataPartos = request.result.partos;

        if (dataPartos.length <= 0) {
          errores.push(`El código: ${codigoBuscar}, no tiene partos`);
        }

        if (errores.length > 0) {
          containerError.classList.add('container-error-visible');
          pError.textContent = '';
          pError.innerHTML = errores.join(', ');
        } else {
          // fragmento de código
          const fragment = document.createDocumentFragment();

          // formulario
          const formularioPartosEncontrados = document.createElement('form');
          formularioPartosEncontrados.setAttribute('id', 'formulario-mostrar-montasEncontradas');
          formularioPartosEncontrados.classList.add('container-mostrarPartos__container-formulario-mostrarPartosEncontrados__formulario-mostrarPartosEncontrados');

          // Código
          const labelCodigo = document.createElement('label');
          labelCodigo.textContent = 'Código:';

          const spanCodigo = document.createElement('span');
          spanCodigo.textContent = dataConejo.codigo;

          formularioPartosEncontrados.appendChild(labelCodigo);
          formularioPartosEncontrados.appendChild(spanCodigo);

          // Bucle que recorre el arreglo "dataPartos"
          // --------------------------------------------------------------------------------------
          dataPartos.forEach((element) => {
            // Parto número
            const labelPartoNumero = document.createElement('label');
            labelPartoNumero.textContent = 'Parto No.:';

            const spanPartoNumero = document.createElement('span');
            spanPartoNumero.textContent = element.numero;

            formularioPartosEncontrados.appendChild(labelPartoNumero);
            formularioPartosEncontrados.appendChild(spanPartoNumero);

            // Parto fecha
            const labelPartoFecha = document.createElement('label');
            labelPartoFecha.textContent = 'Parto fecha:';

            const spanPartoFecha = document.createElement('span');
            spanPartoFecha.textContent = element.fecha;

            formularioPartosEncontrados.appendChild(labelPartoFecha);
            formularioPartosEncontrados.appendChild(spanPartoFecha);

            // Parto total gazapos
            const labelPartoTotalGazapos = document.createElement('label');
            labelPartoTotalGazapos.textContent = 'Total Gazapos:';

            const spanPartoTotalGazapos = document.createElement('span');
            spanPartoTotalGazapos.textContent = element.gazapos;

            formularioPartosEncontrados.appendChild(labelPartoTotalGazapos);
            formularioPartosEncontrados.appendChild(spanPartoTotalGazapos);

            // Parto total gazapos machos
            const labelPartoTotalGazaposMachos = document.createElement('label');
            labelPartoTotalGazaposMachos.textContent = 'G. Machos:';

            const spanPartoTotalGazaposMachos = document.createElement('span');
            spanPartoTotalGazaposMachos.textContent = element.machos;

            formularioPartosEncontrados.appendChild(labelPartoTotalGazaposMachos);
            formularioPartosEncontrados.appendChild(spanPartoTotalGazaposMachos);

            // Parto total gazapos hembras
            const labelPartoTotalGazaposHembras = document.createElement('label');
            labelPartoTotalGazaposHembras.textContent = 'G. Hembras:';

            const spanPartoTotalGazaposHembras = document.createElement('span');
            spanPartoTotalGazaposHembras.textContent = element.hembras;

            formularioPartosEncontrados.appendChild(labelPartoTotalGazaposHembras);
            formularioPartosEncontrados.appendChild(spanPartoTotalGazaposHembras);

            // Parto total gazapos fallecidos
            const labelPartoTotalGazaposFallecidos = document.createElement('label');
            labelPartoTotalGazaposFallecidos.textContent = 'G. Fallecidos:';

            const spanPartoTotalGazaposFallecidos = document.createElement('span');
            spanPartoTotalGazaposFallecidos.textContent = element.fallecidos;

            formularioPartosEncontrados.appendChild(labelPartoTotalGazaposFallecidos);
            formularioPartosEncontrados.appendChild(spanPartoTotalGazaposFallecidos);

            // Append Fragment
            fragment.appendChild(formularioPartosEncontrados);
          });
          // --------------------------------------------------------------------------------------

          // Append Generales (Mostrar los elementos en el contenedor)
          mostrarDivPartosEncontrados.appendChild(fragment);
        }
      }
    });
  });

  request.onerror = ((eventError) => {
    errores.push('Error:', eventError);

    containerError.classList.add('container-error-visible');
    pError.textContent = '';
    pError.innerHTML = errores.join(', ');
  });
}
// ---------------------------------------------------------------------------------------------

// 8.- FUNCIÓN QUE MUESTRA CONEJOS POR RAZA (USO DE INDEX: "by_raza")
//     NOTAS: Muestra todos los conejos por raza, existentes en la base de datos.
//            Muestra el total de conejos en la base de datos y el total de coincidencias.
// ----------------------------------------------------------------------------------------------
function mostrarRaza(selectRazaValor) {
  const transaction = dataBase.transaction(['conejos'], 'readonly');
  const objectStore = transaction.objectStore('conejos');

  // Usamos el index para busquedas de solo tipos de razas incluidas en la BD
  const index = objectStore.index('by_raza');

  // Solo coincidencia con raza "selectRazaValor".
  const singleKeyRange = IDBKeyRange.only(selectRazaValor);

  // Requerimiento para la busqueda del index de raza seleccionada.
  const request = index.openCursor(singleKeyRange);

  // Creamos el fragmento donde se guardaran los pedazos de código a insertar
  const fragment = document.createDocumentFragment();

  // Requerimiento para contar el total de conejos en la base de datos
  // ----------------------------------------------------------------------------
  const requestTotalConejos = index.count();

  requestTotalConejos.onsuccess = (() => {
    totalConejos = requestTotalConejos.result;
  });

  requestTotalConejos.onerror = ((error) => {
    console.log(`Error: ${error}`);
  });
  // ----------------------------------------------------------------------------

  // Requerimiento para contar total de coincidencias encontradas
  // ----------------------------------------------------------------------------
  const requestTotalCoincidencias = index.count(singleKeyRange);

  requestTotalCoincidencias.onsuccess = (() => {
    totalCoincidencias = requestTotalCoincidencias.result;
    containerError.textContent = `Coincidencias: ${totalCoincidencias} / ${totalConejos}`;
    containerError.classList.add('container-error-visible-OK__mostrarRaza');
  });

  requestTotalCoincidencias.onerror = ((error) => {
    console.log(`Error: ${error}`);
  });
  // -----------------------------------------------------------------------------

  request.onsuccess = (() => {
    const cursor = request.result;

    if (cursor) {
      // Código
      const labelCodigo = document.createElement('label');
      labelCodigo.textContent = 'Código:';

      const spanCodigo = document.createElement('span');
      spanCodigo.textContent = cursor.value.codigo;

      fragment.appendChild(labelCodigo);
      fragment.appendChild(spanCodigo);

      // Raza
      const labelRaza = document.createElement('label');
      labelRaza.textContent = 'Raza:';

      const spanRaza = document.createElement('span');
      spanRaza.textContent = cursor.value.raza;

      fragment.appendChild(labelRaza);
      fragment.appendChild(spanRaza);

      // Sexo
      const labelSexo = document.createElement('label');
      labelSexo.textContent = 'Sexo:';

      const spanSexo = document.createElement('span');
      spanSexo.textContent = cursor.value.sexo;

      fragment.appendChild(labelSexo);
      fragment.appendChild(spanSexo);

      cursor.continue();
    } else {
      divRazaEncontrada.appendChild(fragment);
    }
  });

  request.onerror = ((error) => {
    console.log('Error: ', error);
  });
}
// ----------------------------------------------------------------------------------------------

// 9.- FUNCIÓN QUE MUESTRA CONEJOS POR SEXO (USO DE INDEX: "by_sexo")
// ----------------------------------------------------------------------------------------------
function mostrarSexo(selectSexoValor) {
  const transaction = dataBase.transaction(['conejos'], 'readonly');
  const objectStore = transaction.objectStore('conejos');

  // Usamos el index para busquedas de solo sexo requerido en la BD
  const index = objectStore.index('by_sexo');

  // Solo coincidencia con sexo "selectSexoValor".
  const singleKeyRange = IDBKeyRange.only(selectSexoValor);

  // Requerimiento para la busqueda del index de sexo seleccionado
  const request = index.openCursor(singleKeyRange);

  // Creamos el fragmento donde se guardaran los pedazos de código a insertar
  const fragment = document.createDocumentFragment();

  // Requerimiento para contar el total de conejos en la base de datos
  // ----------------------------------------------------------------------------
  const requestTotalConejos = index.count();

  requestTotalConejos.onsuccess = (() => {
    totalConejos = requestTotalConejos.result;
  });

  requestTotalConejos.onerror = ((error) => {
    console.log(`Error: ${error}`);
  });
  // ----------------------------------------------------------------------------

  // Requerimiento para contar total de coincidencias encontradas
  // ----------------------------------------------------------------------------
  const requestTotalCoincidencias = index.count(singleKeyRange);

  requestTotalCoincidencias.onsuccess = (() => {
    totalCoincidencias = requestTotalCoincidencias.result;
    containerError.textContent = `Coincidencias: ${totalCoincidencias} / ${totalConejos}`;
    containerError.classList.add('container-error-visible-OK');
  });

  requestTotalCoincidencias.onerror = ((error) => {
    console.log(`Error: ${error}`);
  });
  // -----------------------------------------------------------------------------

  request.onsuccess = (() => {
    const cursor = request.result;

    if (cursor) {
      // Código
      const labelCodigo = document.createElement('label');
      labelCodigo.textContent = 'Código:';

      const spanCodigo = document.createElement('span');
      spanCodigo.textContent = cursor.value.codigo;

      fragment.appendChild(labelCodigo);
      fragment.appendChild(spanCodigo);

      // Sexo
      const labelSexo = document.createElement('label');
      labelSexo.textContent = 'Sexo:';

      const spanSexo = document.createElement('span');
      spanSexo.textContent = cursor.value.sexo;

      fragment.appendChild(labelSexo);
      fragment.appendChild(spanSexo);

      // Raza
      const labelRaza = document.createElement('label');
      labelRaza.textContent = 'Raza:';

      const spanRaza = document.createElement('span');
      spanRaza.textContent = cursor.value.raza;

      fragment.appendChild(labelRaza);
      fragment.appendChild(spanRaza);

      cursor.continue();
    } else {
      divSexoEncontrado.appendChild(fragment);
    }
  });

  request.onerror = ((error) => {
    console.log('Error: ', error);
  });
}
// ----------------------------------------------------------------------------------------------

// 10.- TIPOS DE BUSQUEDAS POR INDEX
//     NOTA: Es usado solo como ejemplo de los tipos de busquedas que podemos hacer.
// ---------------------------------------------------------------------------------------------
function mostrarTiposIndex() {
  const transaction = dataBase.transaction(['conejos'], 'readonly');
  const objectStore = transaction.objectStore('conejos');
  // Usamos el index para busquedas de solo tipos de razas incluidas en la BD
  const index = objectStore.index('by_raza');

  // Tipos de busquedas posibles
  // -----------------------------------------------------------------------------------------------
  // Solo coincidencia con raza "Azul de viena".
  // Only match "Azul de viena".
  // const singleKeyRange = IDBKeyRange.only('Azul de viena');

  // Incluye "Azul de viena" y todas las demas razas por debajo de esta en la BD
  // Match anything past "Azul de viena", including "Azul de viena"
  // const lowerBoundKeyRange = IDBKeyRange.lowerBound('Azul de viena');

  // Incluye todas las razas por debajo de "Azul de viena", No incluye "Azul de viena"
  // Match anything past "Azul de viena", but don't include "Azul de viena"
  // const lowerBoundOpenKeyRange = IDBKeyRange.lowerBound('Azul de viena', true);

  // Incluye todas por arriba de "Gigante de Flanders", No incluye "Gigante de Flanders"
  // Match anything up to, but not including, "Gigante de Flanders"
  // const upperBoundOpenKeyRange = IDBKeyRange.upperBound('Gigante de Flanders', true);

  // Incluye todas entre "Cabeza de león" y "Nueva Zelanda". Incluye ambas tambien.
  // Match anything between "Cabeza de león" and "Nueva Zelanda"
  // const boundKeyRange = IDBKeyRange.bound('Cabeza de león', 'Nueva Zelanda');

  // Incluye todas entre "Cabeza de león" y "Nueva Zelanda". No incluye estas dos.
  // Match anything between "Cabeza de león" and "Nueva Zelanda", not including this.
  // const boundKeyRange = IDBKeyRange.bound('Cabeza de león', 'Nueva Zelanda', true, true);

  // Incluye todas entre "Cabeza de león" y "Nueva Zelanda". No incluye "Nueva Zelanda".
  // Match anything between "Cabeza de león" and "Nueva Zelanda", but not including "Nueva Zelanda".
  const boundKeyRange = IDBKeyRange.bound('Cabeza de león', 'Nueva Zelanda', false, true);
  // -----------------------------------------------------------------------------------------------

  // const request = index.get(lowerBoundKeyRange);
  const request = index.openCursor(boundKeyRange);

  request.onsuccess = (() => {
    const cursor = request.result;

    if (cursor) {
      console.log(cursor.value);

      cursor.continue();
    } else {
      console.log('No mas objetos en la BD');
    }
  });

  request.onerror = ((error) => {
    console.log('Error: ', error);
  });
}
// ---------------------------------------------------------------------------------------------
/* ============================================================================================== */

/* CÓDIGO PRINCIPAL DEL PROGRAMA (CREACIÓN DE BASES DE DATOS E INDICES).
================================================================================================= */
// 1.- Valida soporte de API IndexedDB, crea BD y STORAGE o almacén.
if (!IndexedDB) {
  console.log('Este navegador no soporta indexedDB');
  alert('indexedDB no es soportado por este navegador');
} else {
  const request = IndexedDB.open(DB_NAME, DB_VERSION);

  request.onsuccess = (() => {
    dataBase = request.result;
    console.log('OPEN DB .....', dataBase);

    if (window.location.pathname.includes('/mostrar.html')) {
      mostrarConejos();
      mostrarTiposIndex();
    }
  });

  request.onupgradeneeded = (() => {
    dataBase = request.result;
    console.log('CREATE DB .....', dataBase);

    const objectStore = dataBase.createObjectStore(DB_STORE_NAME, { keyPath: 'codigo' });
    objectStore.createIndex('by_raza', 'raza', { unique: false });
    objectStore.createIndex('by_sexo', 'sexo', { unique: false });

    objectStore.transaction.oncomplete = ((event) => {
      console.log(`Creación de base de datos '${DB_NAME}', estatus: ${event.type}`);
    });
  });

  request.onerror = ((error) => {
    console.log(`Error OPEN DB: ${error}, Error Código: ${error.target.errorCode}`);
  });
}
/* ============================================================================================== */

/* EVENTOS DE ESCUCHA
================================================================================================= */
// 1.- AGREGAR CONEJO A LA BASE DE DATOS
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/agregar.html')) {
  // 1.1.- Evento de escucha del 'selecSexo', formularioAgregar (agregar.html).
  formularioAgregar.selectSexo.addEventListener('change', (event) => {
    event.preventDefault();
    errores = [];
    divTextFile.textContent = '';
    const selectSexoValor = event.target.value;

    if ((selectSexoValor === '') || (selectSexoValor === 'Seleccione')) {
      errores.push('Sexo requerido');
      // formularioAgregar.selectSexo.focus();
    }

    if ((selectSexoValor !== 'Macho') && (selectSexoValor !== 'Hembra')) {
      errores.push('Sexo permitido, solo Macho o Hembra');
      // formularioAgregar.selectSexo.focus();
    }

    if (errores.length > 0) {
      event.preventDefault();
      containerError.classList.add('container-error-visible');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      const fragment = document.createDocumentFragment();

      // Código
      const labelCodigo = document.createElement('label');
      labelCodigo.textContent = 'Código:';
      labelCodigo.setAttribute('for', 'inputCodigo');

      const inputCodigo = document.createElement('input');
      inputCodigo.setAttribute('type', 'text');
      inputCodigo.setAttribute('id', 'inputCodigo');
      inputCodigo.setAttribute('name', 'inputCodigo');
      inputCodigo.setAttribute('required', 'required');
      inputCodigo.setAttribute('minlength', '1');
      inputCodigo.setAttribute('maxlength', '3');
      inputCodigo.setAttribute('autocomplete', 'off');
      inputCodigo.setAttribute('autofocus', 'autofocus');
      inputCodigo.setAttribute('placeholder', 'númerico rango (001 - 999)');

      fragment.appendChild(labelCodigo);
      fragment.appendChild(inputCodigo);

      // Sexo
      const labelSexo = document.createElement('label');
      labelSexo.textContent = 'Sexo:';
      labelSexo.setAttribute('for', 'selectSexo');

      fragment.appendChild(labelSexo);

      const selectSexo = document.createElement('select');
      selectSexo.setAttribute('id', 'selectSexo');
      selectSexo.setAttribute('name', 'selectSexo');

      if (selectSexoValor === 'Macho') {
        const selectSexoOption1 = document.createElement('option');
        selectSexoOption1.textContent = 'Macho';
        selectSexoOption1.setAttribute('value', 'Macho');

        selectSexo.appendChild(selectSexoOption1);
      } else if (selectSexoValor === 'Hembra') {
        const selectSexoOption1 = document.createElement('option');
        selectSexoOption1.textContent = 'Hembra';
        selectSexoOption1.setAttribute('value', 'Hembra');

        selectSexo.appendChild(selectSexoOption1);
      }

      fragment.appendChild(selectSexo);

      // Razas
      const labelRaza = document.createElement('label');
      labelRaza.textContent = 'Raza:';
      labelRaza.setAttribute('for', 'selectRaza');

      const selectRaza = document.createElement('select');
      selectRaza.setAttribute('id', 'selectRaza');
      selectRaza.setAttribute('name', 'selectRaza');

      const selectRazaOption1 = document.createElement('option');
      selectRazaOption1.setAttribute('value', 'Seleccione');
      selectRazaOption1.textContent = 'Seleccione';

      const selectRazaOption2 = document.createElement('option');
      selectRazaOption2.setAttribute('value', 'Azul de viena');
      selectRazaOption2.textContent = 'Azul de viena';

      const selectRazaOption3 = document.createElement('option');
      selectRazaOption3.setAttribute('value', 'Cabeza de león');
      selectRazaOption3.textContent = 'Cabeza de león';

      const selectRazaOption4 = document.createElement('option');
      selectRazaOption4.setAttribute('value', 'Californiano');
      selectRazaOption4.textContent = 'Californiano';

      const selectRazaOption5 = document.createElement('option');
      selectRazaOption5.setAttribute('value', 'Gigante de Flanders');
      selectRazaOption5.textContent = 'Gigante de Flanders';

      const selectRazaOption6 = document.createElement('option');
      selectRazaOption6.setAttribute('value', 'Mariposa');
      selectRazaOption6.textContent = 'Mariposa';

      const selectRazaOption7 = document.createElement('option');
      selectRazaOption7.setAttribute('value', 'Mini Rex');
      selectRazaOption7.textContent = 'Mini Rex';

      const selectRazaOption8 = document.createElement('option');
      selectRazaOption8.setAttribute('value', 'Nueva Zelanda');
      selectRazaOption8.textContent = 'Nueva Zelanda';

      fragment.appendChild(labelRaza);
      selectRaza.appendChild(selectRazaOption1);
      selectRaza.appendChild(selectRazaOption2);
      selectRaza.appendChild(selectRazaOption3);
      selectRaza.appendChild(selectRazaOption4);
      selectRaza.appendChild(selectRazaOption5);
      selectRaza.appendChild(selectRazaOption6);
      selectRaza.appendChild(selectRazaOption7);
      selectRaza.appendChild(selectRazaOption8);
      fragment.appendChild(selectRaza);

      // Líneas
      const labelLineas = document.createElement('label');
      labelLineas.textContent = 'Líneas:';
      labelLineas.setAttribute('for', 'selectLineas');

      const selectLineas = document.createElement('select');
      selectLineas.setAttribute('id', 'selectLineas');
      selectLineas.setAttribute('name', 'selectLineas');

      const selectLineasOption1 = document.createElement('option');
      selectLineasOption1.setAttribute('value', 'Seleccione');
      selectLineasOption1.textContent = 'Seleccione';

      const selectLineasOption2 = document.createElement('option');
      selectLineasOption2.setAttribute('value', 'Melendero');
      selectLineasOption2.textContent = 'Melendero';

      fragment.appendChild(labelLineas);
      selectLineas.appendChild(selectLineasOption1);
      selectLineas.appendChild(selectLineasOption2);
      fragment.appendChild(selectLineas);

      // Génotipo
      const labelGenotipo = document.createElement('label');
      labelGenotipo.textContent = 'Génotipo:';
      labelGenotipo.setAttribute('for', 'selectGenotipo');

      const selectGenotipo = document.createElement('select');
      selectGenotipo.setAttribute('id', 'selectGenotipo');
      selectGenotipo.setAttribute('name', 'selectGenotipo');

      const selectGenotipoOption1 = document.createElement('option');
      selectGenotipoOption1.setAttribute('value', 'Seleccione');
      selectGenotipoOption1.textContent = 'Seleccione';

      const selectGenotipoOption2 = document.createElement('option');
      selectGenotipoOption2.setAttribute('value', '1-3');
      selectGenotipoOption2.textContent = '1-3';

      const selectGenotipoOption3 = document.createElement('option');
      selectGenotipoOption3.setAttribute('value', '2-2');
      selectGenotipoOption3.textContent = '2-2';

      const selectGenotipoOption4 = document.createElement('option');
      selectGenotipoOption4.setAttribute('value', '3-1');
      selectGenotipoOption4.textContent = '3-1';

      fragment.appendChild(labelGenotipo);
      selectGenotipo.appendChild(selectGenotipoOption1);
      selectGenotipo.appendChild(selectGenotipoOption2);
      selectGenotipo.appendChild(selectGenotipoOption3);
      selectGenotipo.appendChild(selectGenotipoOption4);
      fragment.appendChild(selectGenotipo);

      // Fénotipo Dominante
      const labelFenotipoD = document.createElement('label');
      labelFenotipoD.textContent = 'Fénotipo D:';
      labelFenotipoD.setAttribute('for', 'inputFenotipoD');

      const inputFenotipoD = document.createElement('input');
      inputFenotipoD.setAttribute('id', 'inputFenotipoD');
      inputFenotipoD.setAttribute('type', 'text');
      inputFenotipoD.setAttribute('name', 'inputFenotipoD');
      inputFenotipoD.setAttribute('minlength', '1');
      inputFenotipoD.setAttribute('maxlength', '50');
      inputFenotipoD.setAttribute('autocomplete', 'off');
      inputFenotipoD.setAttribute('placeholder', 'texto rango (1 - 50)');

      fragment.appendChild(labelFenotipoD);
      fragment.appendChild(inputFenotipoD);

      // Fénotipo Rececivo
      const labelFenotipoR = document.createElement('label');
      labelFenotipoR.textContent = 'Fénotipo R:';
      labelFenotipoR.setAttribute('for', 'inputFenotipoR');

      const inputFenotipoR = document.createElement('input');
      inputFenotipoR.setAttribute('id', 'inputFenotipoR');
      inputFenotipoR.setAttribute('type', 'text');
      inputFenotipoR.setAttribute('name', 'inputFenotipoR');
      inputFenotipoR.setAttribute('minlength', '1');
      inputFenotipoR.setAttribute('maxlength', '50');
      inputFenotipoR.setAttribute('autocomplete', 'off');
      inputFenotipoR.setAttribute('placeholder', 'texto rango (1 - 50)');

      fragment.appendChild(labelFenotipoR);
      fragment.appendChild(inputFenotipoR);

      // Nacimiento
      const labelNacimiento = document.createElement('label');
      labelNacimiento.textContent = 'Nacimiento:';
      labelNacimiento.setAttribute('for', 'dateNacimiento');

      const dateNacimiento = document.createElement('input');
      dateNacimiento.setAttribute('id', 'dateNacimiento');
      dateNacimiento.setAttribute('type', 'date');
      dateNacimiento.setAttribute('name', 'dateNacimiento');

      fragment.appendChild(labelNacimiento);
      fragment.appendChild(dateNacimiento);

      // Peso
      const labelPeso = document.createElement('label');
      labelPeso.textContent = 'Peso (Kg):';
      labelPeso.setAttribute('for', 'inputPeso');

      const inputPeso = document.createElement('input');
      inputPeso.setAttribute('id', 'inputPeso');
      inputPeso.setAttribute('type', 'text');
      inputPeso.setAttribute('name', 'inputPeso');
      inputPeso.setAttribute('autocomplete', 'off');
      inputPeso.setAttribute('placeholder', 'texto rango (0.1 - 6.0)');

      fragment.appendChild(labelPeso);
      fragment.appendChild(inputPeso);

      // Button
      const button = document.createElement('button');
      button.setAttribute('type', 'submit');
      button.textContent = 'Agregar';
      button.classList.add('container-formulario__formularioAgregar__container-button__button');

      // AppendChild
      divButton.appendChild(button);
      fragment.appendChild(divButton);
      divTextFile.appendChild(fragment);
    }
  });

  // 1.2.- Evento de escucha del 'submit', formularioAgregar (agregar.html).
  formularioAgregar.addEventListener('submit', (event) => {
    event.preventDefault();
    errores = [];
    pError.textContent = '';
    containerError.classList.remove('container-error-visible');

    // Constantes y variables compartidas (Machos y Hembras).
    const Ccodigo = formularioAgregar.inputCodigo.value;
    const Csexo = formularioAgregar.selectSexo.value;
    let Craza = formularioAgregar.selectRaza.value;
    let Clinea = formularioAgregar.selectLineas.value;
    let Cgenotipo = formularioAgregar.selectGenotipo.value;
    const CfenotipoD = formularioAgregar.inputFenotipoD.value;
    const CfenotipoR = formularioAgregar.inputFenotipoR.value;
    const Cnacimiento = formularioAgregar.dateNacimiento.value;
    const Cpeso = (formularioAgregar.inputPeso.value);

    // Validación de constantes y variables compartidas.
    if (Ccodigo === '') {
      errores.push('Código requerido');
      formularioAgregar.inputCodigo.focus();
    } else if ((Ccodigo.length < 3) || (Ccodigo.length > 3)) {
      errores.push(`Error: código ${Ccodigo}, rango (001 - 999)`);
    } else if (Cnacimiento === '') {
      errores.push('Nacimiento requerido');
      formularioAgregar.dateNacimiento.focus();
    } else if ((Cpeso < 0) || (Cpeso > 6)) {
      errores.push('Peso rango (0-6)');
      formularioAgregar.inputPeso.focus();
    }

    if (Craza === 'Seleccione') {
      Craza = '';
    }

    if (Clinea === 'Seleccione') {
      Clinea = '';
    }

    if (Cgenotipo === 'Seleccione') {
      Cgenotipo = '';
    }

    // Validación de errores
    if (errores.length > 0) {
      event.preventDefault();
      containerError.classList.add('container-error-visible');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      agregarConejo(Ccodigo, Csexo, Craza, Clinea, Cgenotipo, CfenotipoD, CfenotipoR, Cnacimiento, Cpeso);
    }
  });
}
// -------------------------------------------------------------------------------------------

// 2.- BUSCAR CONEJO EN LA BASE DE DATOS POR CÓDIGO. LLAMA A LA FUNCIÓN "buscarMontas()".
//     NOTA: La función "buscarMontas()", permite agregar nuevas montas a la BD.
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/agregar-montas.html')) {
  // 2.1.- Evento de escucha buscar código de conejo (Montas)
  formularioBuscarMontas.addEventListener('submit', (event) => {
    event.preventDefault();
    errores = [];

    const codigoBuscar = formularioBuscarMontas.inputBuscarMontas.value;

    if (!codigoBuscar) {
      errores.push('Error: código indefinido .....');
    } else if (codigoBuscar === '') {
      errores.push('Error: código requerido .....');
    } else if ((codigoBuscar.length < 3) || (codigoBuscar.length > 3)) {
      errores.push(`Error: código ${codigoBuscar}, rango (001 - 999)`);
    }

    if (errores.length > 0) {
      containerError.classList.add('container-error-visible');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      formularioBuscarMontas.reset();
      buscarMontas(codigoBuscar);
    }
  });
}
// -------------------------------------------------------------------------------------------

// 3.- BUSCAR CONEJO EN LA BASE DE DATOS POR CÓDIGO. LLAMA A LA FUNCIÓN "buscarPartos()".
//     NOTA: La función "buscarPartos()", permite agregar nuevos partos a la DB.
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/agregar-partos.html')) {
  // 3.1.- Evento de escucha buscar código de conejo (Partos)
  formularioBuscarPartos.addEventListener('submit', (event) => {
    event.preventDefault();
    errores = [];

    const codigoBuscar = formularioBuscarPartos.inputBuscarPartos.value;

    if (!codigoBuscar) {
      errores.push('Error: código indefinido .....');
    } else if (codigoBuscar === '') {
      errores.push('Error: código requerido .....');
    } else if ((codigoBuscar.length < 3) || (codigoBuscar.length > 3)) {
      errores.push(`Error: código ${codigoBuscar}, rango (001 - 999)`);
    }

    if (errores.length > 0) {
      containerError.classList.add('container-error-visible');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      formularioBuscarPartos.reset();
      buscarPartos(codigoBuscar);
    }
  });
}
// -------------------------------------------------------------------------------------------

// 4.- BUSCAR CONEJO EN LA BASE DE DATOS POR CÓDIGO. LLAMA A FUNCIÓN "buscarConejo()".
//     NOTA: La función "buscarConejo()", busca por código de conejo y permite actualizar
//           y eliminar conejos de la base de datos.
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/buscar.html')) {
  // 4.1.- Evento de escucha buscar código de conejo
  formularioBuscar.addEventListener('submit', (event) => {
    event.preventDefault();
    errores = [];
    pError.textContent = '';
    containerError.classList.remove('container-error-visible__buscar');
    divDataEncontrada.textContent = '';

    const codigoBuscar = formularioBuscar.inputBuscar.value;

    if (!codigoBuscar) {
      errores.push('Error: código indefinido .....');
    } else if (codigoBuscar === '') {
      errores.push('Error: código requerido .....');
    } else if ((codigoBuscar.length < 3) || (codigoBuscar.length > 3)) {
      errores.push(`Error: código ${codigoBuscar}, rango (001 - 999)`);
    }

    if (errores.length > 0) {
      containerError.classList.add('container-error-visible__buscar');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      formularioBuscar.reset();
      buscarConejo(codigoBuscar);
    }
  });
}
// -------------------------------------------------------------------------------------------

// 5.- MOSTRAR CONEJOS NO TIENE EVENTO DE ESCUCHA.
//     NOTA: La función "mostrarConejos()", es llamada al abrir la base de datos, en el
//           request.onsuccess, siempre seleccionemos la opción "Mostrar Conejos".
// -------------------------------------------------------------------------------------------

// 6.- BUSCAR CONEJO EN LA BASE DE DATOS POR CÓDIGO. LLAMA A FUNCIÓN "MostrarMontas()".
//     NOTA: La función "mostrarMontas()", busca por código de conejo y muestra la data de
//           las montas existentes en la base de datos.
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/mostrar-montas.html')) {
  // 6.1.- Evento de escucha del submit en buscar código de conejo (mostrar-montas.html)
  mostrarFormularioBuscarMontas.addEventListener('submit', (event) => {
    event.preventDefault();
    errores = [];
    containerError.classList.remove('container-error-visible__mostrar-montas');
    mostrarDivMontasEncontradas.textContent = '';

    const codigoBuscar = mostrarFormularioBuscarMontas.inputBuscarMontas.value;

    if (!codigoBuscar) {
      errores.push('Error: código indefinido .....');
    } else if (codigoBuscar === '') {
      errores.push('Error: código requerido .....');
    } else if ((codigoBuscar.length < 3) || (codigoBuscar.length > 3)) {
      errores.push(`Error: código ${codigoBuscar}, rango (001 - 999)`);
    }

    if (errores.length > 0) {
      containerError.classList.add('container-error-visible__mostrar-montas');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      mostrarFormularioBuscarMontas.reset();
      mostrarMontas(codigoBuscar);
    }
  });
}
// --------------------------------------------------------------------------------------------

// 7.- BUSCAR CONEJO EN LA BASE DE DATOS POR CÓDIGO. LLAMA A FUNCIÓN "MostrarPartos()".
//     NOTA: La función "mostrarPartos()", busca por código de conejo y muestra la data de
//           los partos existentes en la base de datos.
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/mostrar-partos.html')) {
  // 7.1.- Evento de escucha del submit en buscar código de conejo (mostrar-partos.html)
  mostrarFormularioBuscarPartos.addEventListener('submit', (event) => {
    event.preventDefault();
    errores = [];
    containerError.classList.remove('container-error-visible__mostrar-partos');
    mostrarDivPartosEncontrados.textContent = '';

    const codigoBuscar = mostrarFormularioBuscarPartos.inputBuscarPartos.value;

    if (!codigoBuscar) {
      errores.push('Error: código indefinido .....');
    } else if (codigoBuscar === '') {
      errores.push('Error: código requerido .....');
    } else if ((codigoBuscar.length < 3) || (codigoBuscar.length > 3)) {
      errores.push(`Error: código ${codigoBuscar}, rango (001 - 999)`);
    }

    if (errores.length > 0) {
      containerError.classList.add('container-error-visible__mostrar-partos');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      mostrarFormularioBuscarPartos.reset();
      mostrarPartos(codigoBuscar);
    }
  });
}
// --------------------------------------------------------------------------------------------

// 8.- MOSTRAR CONEJO POR RAZA. LLAMA A FUNCIÓN "mostrarRaza()".
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/mostrar-raza.html')) {
  // 8.1.- Evento de escucha selectRaza en mostrar-raza.html
  formularioSelectRaza.selectRaza.addEventListener('change', (event) => {
    event.preventDefault();

    errores = [];
    containerError.classList.remove('container-error-visible__mostrarRaza');
    containerError.classList.remove('container-error-visible-OK__mostrarRaza');

    containerError.textContent = '';
    divRazaEncontrada.textContent = '';

    const selectRazaValor = event.target.value;

    if ((selectRazaValor === '') || (selectRazaValor === 'Seleccione')) {
      errores.push('Raza requerida .....');
    }

    if (errores.length > 0) {
      event.preventDefault();
      containerError.classList.add('container-error-visible__mostrarRaza');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      mostrarRaza(selectRazaValor);
    }
  });
}
// -------------------------------------------------------------------------------------------

// 9.- MOSTRAR CONEJO POR SEXO. LLAMA A FUNCIÓN "mostrarSexo()".
// -------------------------------------------------------------------------------------------
if (window.location.pathname.includes('/mostrar-sexo.html')) {
  // 9.1.- Evento de escucha selectSexo en mostrar-sexo.html
  formularioSelectSexo.selectSexo.addEventListener('change', (event) => {
    event.preventDefault();

    errores = [];
    containerError.classList.remove('container-error-visible__mostrarSexo');

    divSexoEncontrado.textContent = '';

    const selectSexoValor = event.target.value;

    if ((selectSexoValor === '') || (selectSexoValor === 'Seleccione')) {
      errores.push('Sexo requerido .....');
    }

    if (errores.length > 0) {
      event.preventDefault();
      containerError.classList.add('container-error-visible__mostrarSexo');
      pError.textContent = '';
      pError.innerHTML = errores.join(', ');
    } else {
      mostrarSexo(selectSexoValor);
    }
  });
}
// -------------------------------------------------------------------------------------------

// 10.- TIPOS DE BUSQUEDAS POR INDEX. NO TIENE EVENTO DE ESCUCHA
//      NOTA: Es usado solo como ejemplo de los tipos de busquedas que podemos hacer.
// -------------------------------------------------------------------------------------------
/* ============================================================================================== */
