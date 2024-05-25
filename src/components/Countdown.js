import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './Countdown.css'; // Importando o arquivo CSS

const Countdown = () => {
    const [countdowns, setCountdowns] = useState([]);

    useEffect(() => {
        // Configurar o Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyCf9wiB-DSJJbbzXTfIFcx42tfO_n2SUzw",
            authDomain: "net-stabliser.firebaseapp.com",
            databaseURL: "https://net-stabliser-default-rtdb.firebaseio.com",
            projectId: "net-stabliser",
            storageBucket: "net-stabliser.appspot.com",
            messagingSenderId: "1002481110551",
            appId: "1:1002481110551:web:e7a439f4b87aeaff2b1652"
        };
        firebase.initializeApp(firebaseConfig);

        // Referência para o nó do banco de dados
        const dbRef = firebase.database().ref('/id-log');

        // Função para atualizar o tempo de contagem regressiva
        const updateCountdown = (uniqueId, currentTime) => {
            const interval = setInterval(() => {
                // Obter os dados atuais do Firebase
                dbRef.child(uniqueId).once('value', snapshot => {
                    const time = snapshot.child('time').val();
                    const [hours, minutes] = time.split(':');
                    let totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);

                    // Diminuir um minuto
                    totalMinutes--;

                    // Convertendo de volta para o formato de hora (HH:mm)
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMinutes = totalMinutes % 60;
                    const newTime = `${newHours < 10 ? '0' + newHours : newHours}:${newMinutes < 10 ? '0' + newMinutes : newMinutes}`;

                    // Atualizando o nó com o novo valor de tempo
                    dbRef.child(`${uniqueId}/time`).set(newTime);

                    // Se o tempo chegar a 00:00, pare o intervalo
                    if (totalMinutes === 0) {
                        clearInterval(interval);
                    }
                });
            }, 60000); // 60000 milissegundos = 1 minuto
        };

        // Obter dados do Firebase e iniciar contagem regressiva para cada hora
        dbRef.on('value', snapshot => {
            const countdownsData = [];
            snapshot.forEach(childSnapshot => {
                const uniqueId = childSnapshot.key;
                const time = childSnapshot.child('time').val();
                countdownsData.push({ uniqueId, time });

                // Iniciar contagem regressiva para cada hora
                updateCountdown(uniqueId, time);
            });
            setCountdowns(countdownsData);
        });

        return () => {
            // Limpar o ouvinte do Firebase quando o componente for desmontado
            dbRef.off();
        };
    }, []);

    const handleRefreshClick = () => {
        // Atualiza a página quando o botão de atualização é clicado
        window.location.reload();
    };

    return (
        <div className="container"> {/* Adicionando a classe container */}
            <h1>Contagem Regressiva</h1>
            <div>
                {countdowns.map(({ uniqueId, time }) => (
                    <div key={uniqueId}>{uniqueId}: {time}</div>
                ))}
            </div>
            <button className="refresh-button" onClick={handleRefreshClick}>Refresh</button> {/* Adicionando o botão com a classe refresh-button e o evento de clique */}
        </div>
    );
};

export default Countdown;
