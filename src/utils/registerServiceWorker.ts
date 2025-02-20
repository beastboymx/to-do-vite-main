export default function registerServiceWorker(){
    if('serviceWorker' in navigator){
        window.addEventListener('load', ()=>{
            navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration)=>{
                console.log('Service Worker registrado con Exito:', registration);
            })
            .catch((error) =>{
                console.log('Error al registrar el service Worker', error);
            });
        });
    }
}