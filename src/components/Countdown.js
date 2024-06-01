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
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Referência para o nó do banco de dados
        const dbRef = firebase.database().ref('/id-log');

        // Função para atualizar o tempo de contagem regressiva
        const updateCountdown = (uniqueId, currentTime) => {
            const interval = setInterval(() => {
                // Obter os dados atuais do Firebase
                dbRef.child(uniqueId).once('value', snapshot => {
                    const time = snapshot.child('time').val();
                    if (time) { // Verificação adicionada
                        const [hours, minutes] = time.split(':').map(Number);
                        if (isNaN(hours) || isNaN(minutes)) {
                            clearInterval(interval);
                            return;
                        }

                        let totalMinutes = hours * 60 + minutes;

                        // Diminuir um minuto
                        totalMinutes--;

                        // Convertendo de volta para o formato de hora (HH:mm)
                        const newHours = Math.floor(totalMinutes / 60);
                        const newMinutes = totalMinutes % 60;
                        const newTime = `${newHours < 10 ? '0' + newHours : newHours}:${newMinutes < 10 ? '0' + newMinutes : newMinutes}`;

                        // Atualizando o nó com o novo valor de tempo
                        dbRef.child(`${uniqueId}/time`).set(newTime);

                        // Se o tempo chegar a 00:00, pare o intervalo
                        if (totalMinutes <= 0) {
                            clearInterval(interval);
                        }
                    } else {
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
                if (time) { // Verificação adicionada
                    countdownsData.push({ uniqueId, time });

                    // Iniciar contagem regressiva para cada hora
                    updateCountdown(uniqueId, time);
                }
            });
            setCountdowns(countdownsData);
        });

        return () => {
            // Limpar o ouvinte do Firebase quando o componente for desmontado
            dbRef.off();
        };
    }, []);

    const handleWhatsappClick = () => {
        // Abre o link do WhatsApp ao clicar no botão
        window.open('https://wa.link/199y22', '_blank');
    };

    const handleDownloadClick = () => {
        const dbRef = firebase.database().ref('/linkdown');
        dbRef.once('value', snapshot => {
            const downloadLink = snapshot.val();
            if (downloadLink) {
                window.open(downloadLink, '_blank');
            } else {
                alert('Link de download não disponível.');
            }
        });
    };

    return (
        <div className="container">
            <h1 className="title">Web in Build</h1>
            <div className="new-elements-container">
                <div className="image-container">
                    <img src="/images/bg.png" alt="Imagem" className="main-image" />
                </div>
                <div className="text-container">
                    <p style={{ color: 'white', textAlign: 'justify', paddingLeft: '20px', paddingRight: '20px', marginBottom: '20px' }}>
                        Ao iniciar o aplicativo, você será solicitado a conceder as permissões necessárias, como acesso à internet e serviços de localização, garantindo que o NetStabiliser funcione corretamente.
                        Com um simples toque no interruptor, você pode iniciar o processo de teste de rede. O aplicativo executa testes de ping para múltiplos destinos e registra os resultados em tempo real.
                        Todos os resultados dos testes são exibidos em um log detalhado, acessível dentro do aplicativo. Você pode percorrer o log para ver o status de cada teste, junto com carimbos de data/hora e mensagens detalhadas.
                        Mantenha-se informado com notificações em tempo real sobre o status da sua rede. O aplicativo envia alertas diretamente para o seu dispositivo, garantindo que você esteja sempre ciente de quaisquer problemas.
                        Você pode interromper os testes de rede a qualquer momento utilizando o interruptor. O aplicativo cessará todos os testes em andamento e atualizará o status conforme necessário.
                    </p>
                    <strong style={{ paddingLeft: '20px', paddingRight: '20px' }}>Faça Doações para Futuros Upgrades:</strong>
                    <p style={{ color: 'white', textAlign: 'justify', paddingLeft: '20px', paddingRight: '20px', marginBottom: '20px' }}>
                        Se você gostou do NetStabiliser e deseja apoiar seu desenvolvimento contínuo, considere fazer uma doação. Qualquer contribuição a partir de $2 USD será muito apreciada e nos ajudará a implementar novos recursos e melhorias. Faça sua doação através do PayPal para o seguinte endereço de e-mail: Justinojoserauanheque7@gmail.com. Obrigado por sua generosidade e apoio contínuo!
                    </p>
                    <button className="download-button" onClick={handleDownloadClick}>Download Arquivo</button>
                </div>
            </div>
            <div className="countdown-container">
                <button className="refresh-button" onClick={handleWhatsappClick}>Abrir WhatsApp</button>
            </div>
        </div>
    );
};

export default Countdown;
