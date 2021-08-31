/* 
Nombre: Reports.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para gestionar la generación de reportes del sistema
*/
import React, { useState, useRef, useEffect } from 'react';
import { Text, ScrollView, StyleSheet, Platform, Linking } from 'react-native';
import { Item, Alert } from '../components';
import * as FileSystem from 'expo-file-system';
import * as MailComposer from 'expo-mail-composer';
import { API } from '../lib';
import moment from 'moment';

export default (props) => {
  var [downloading, setDownloading] = useState(false);
  var [user, setUser] = useState(false);

  props.navigation.setOptions({
    headerTitle: 'Reportes',
  });

  var getFile = (url, name, setLoading) => {
    return Platform.select({
      ios: emailFile,
      android: emailFile,
      web: () => {
        Linking.openURL(url);
      },
    })(url, name, setLoading);
  };

  useEffect(() => {
    API.getUser().then(setUser);
  }, []);

  var emailFile = (url, name, setLoading) => {
    setLoading(true);
    FileSystem.downloadAsync(url, FileSystem.documentDirectory + name)
      .then((d) => {
        setDownloading(false);
        setLoading(false);
        if (d.stats == 404)
          return Alert.alert('Hubo un error cargando el reporte.');
        MailComposer.composeAsync({
          attachments: [d.uri],
        });
      })
      .catch((err) => {
        setDownloading(false);
        setLoading(false);
        return Alert.alert('Hubo un error cargando el reporte.');
      });
  };

  var reportAllGrupos = (setLoading) => {
    if (downloading) return;
    API.formatURL('grupos/dump').then((url) => {
      getFile(url, 'Grupos.csv', setLoading);
    });
  };

  var reportAllCapacitaciones = (setLoading) => {
    if (downloading) return;
    API.formatURL('capacitacion/dump').then((url) => {
      getFile(url, 'Capacitaciones.csv', setLoading);
    });
  };

  var reportGroup = (setLoading) => {
    if (downloading) return;
    props.navigation.navigate('SelectGroup', {
      onSelect: function (g) {
        // Added unix to the end to prevent Cache on iOS file download.
        API.formatURL(
          'grupos/' + g.id + '/asistencia/reporte/' + moment().unix() + '.csv'
        ).then((url) => {
          getFile(
            url,
            'Miembros-' + g.nombre.replace(/ /g, '_') + '.csv',
            setLoading
          );
        });
      },
    });
  };

  var reportGroupAssistance = (setLoading) => {
    if (downloading) return;
    props.navigation.navigate('SelectGroup', {
      onSelect: (g) => {
        API.formatURL(
          'grupos/' +
            g.id +
            '/asistencia/reportefechas/' +
            moment().unix() +
            '.csv'
        ).then((url) => {
          getFile(
            url,
            'GrupoAsistencias-' + g.nombre.replace(/ /g, '_') + '.csv',
            setLoading
          );
        });
      },
    });
  };

  var reportCapacitacion = (setLoading) => {
    if (downloading) return;
    props.navigation.navigate('SelectCapacitacion', {
      onSelect: (g) => {
        API.formatURL(
          'capacitacion/' +
            g.id +
            '/asistencia/reporte/' +
            moment().unix() +
            '.csv'
        ).then((url) => {
          getFile(
            url,
            'Participantes-' + g.nombre.replace(/ /g, '_') + '.csv',
            setLoading
          );
        });
      },
    });
  };

  var reportCapacitacionAssistance = (setLoading) => {
    if (downloading) return;
    props.navigation.navigate('SelectCapacitacion', {
      onSelect: (g) => {
        API.formatURL(
          'capacitacion/' +
            g.id +
            '/asistencia/reportefechas/' +
            moment().unix() +
            '.csv'
        ).then((url) => {
          getFile(
            url,
            'CapacitacionAsistencias-' + g.nombre.replace(/ /g, '_') + '.csv',
            setLoading
          );
        });
      },
    });
  };

  var reportParroquias = (setLoading) => {
    if (downloading) return;
    if (
      user.type == 'acompañante_decanato' ||
      user.type == 'acompañante_zona'
    ) {
      API.formatURL('parroquias/dumpAcompanante/' + user.id).then((url) => {
        getFile(url, 'Parroquias.csv', setLoading);
      });
    } else {
      API.formatURL('parroquias/dump/' + moment().unix() + '.csv').then(
        (url) => {
          getFile(url, 'Parroquias.csv', setLoading);
        }
      );
    }
  };

  var reportCapillas = (setLoading) => {
    if (downloading) return;
    if (
      user.type == 'acompañante_decanato' ||
      user.type == 'acompañante_zona'
    ) {
      API.formatURL('capillas/dumpAcompanante/' + user.id).then((url) => {
        getFile(url, 'Capillas.csv', setLoading);
      });
    } else {
      API.formatURL('capillas/dump/' + moment().unix() + '.csv').then((url) => {
        getFile(url, 'Capillas.csv', setLoading);
      });
    }
  };

  var reportAcompanantes = (setLoading) => {
    if (downloading) return;
    API.formatURL('reporte/acompanantes').then((url) => {
      getFile(url, 'Acompanantes.csv', setLoading);
    });
  };

  var reportAdministradores = (setLoading) => {
    if (downloading) return;
    API.formatURL('reporte/admins').then((url) => {
      getFile(url, 'Administradores.csv', setLoading);
    });
  };

  var reportCoordinadores = (setLoading) => {
    if (downloading) return;
    if (
      user.type == 'acompañante_decanato' ||
      user.type == 'acompañante_zona'
    ) {
      API.formatURL('reporte/coordinadoresAcompanante/' + user.id).then(
        (url) => {
          getFile(url, 'Coordinadores.csv', setLoading);
        }
      );
    } else {
      API.formatURL('reporte/coordinadores').then((url) => {
        getFile(url, 'Coordinadores.csv', setLoading);
      });
    }
  };

  var reportDecanatos = (setLoading) => {
    if (downloading) return;
    if (
      user.type == 'acompañante_decanato' ||
      user.type == 'acompañante_zona'
    ) {
      API.formatURL('reporte/decanatosAcompanante/' + user.id).then((url) => {
        getFile(url, 'Decanatos.csv', setLoading);
      });
    } else {
      API.formatURL('reporte/decanatos').then((url) => {
        getFile(url, 'Decanatos.csv', setLoading);
      });
    }
  };

  var reportZonas = (setLoading) => {
    if (downloading) return;
    API.formatURL('reporte/zonas').then((url) => {
      getFile(url, 'Zonas.csv', setLoading);
    });
  };

  var reportEventos = (setLoading) => {
    if (downloading) return;
    API.formatURL('eventos/dump/' + moment().unix()).then((url) => {
      getFile(url, 'Eventos.csv', setLoading);
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={[styles.sectionText, { marginTop: 10 }]}>GRUPOS</Text>
      {['admin', 'integrante_chm'].includes(user.type) ? (
        <Item text="Todos los grupos" onPress={reportAllGrupos} />
      ) : null}
      {user.type != 'capacitacion' ? (
        <>
          <Item text="Miembros de grupo" onPress={reportGroup} />
          <Item
            text="Asistencia de grupo por fecha"
            onPress={reportGroupAssistance}
          />
        </>
      ) : null}

      {[
        'admin',
        'integrante_chm',
        'acompañante_zona',
        'acompañante_decanato',
      ].includes(user.type) ? (
          <>
            <Text style={styles.sectionText}>CAPACITACIONES</Text>
            <Item
              text="Todas las capacitaciones"
              onPress={reportAllCapacitaciones}
            />
            <Item
              text="Participantes de capacitación"
              onPress={reportCapacitacion}
            />
            <Item
              text="Asistencia de capacitación"
              onPress={reportCapacitacionAssistance}
            />
          </>
        ) : null}

      {[
        'admin',
        'integrante_chm',
        'acompañante_zona',
        'acompañante_decanato',
        'capacitacion',
      ].includes(user.type) ? (
          <>
            <Text style={styles.sectionText}>PARROQUIAS</Text>
            <Item text="Parroquias" onPress={reportParroquias} />
            <Item text="Capillas" onPress={reportCapillas} />
          </>
        ) : null}

      <Text style={styles.sectionText}>OTROS</Text>
      {['admin', 'integrante_chm'].includes(user.type) ? (
        <>
          <Item text="Acompañantes" onPress={reportAcompanantes} />
          <Item text="Administradores" onPress={reportAdministradores} />
        </>
      ) : null}
      {[
        'admin',
        'integrante_chm',
        'capacitacion',
        'acompañante_decanato',
        'acompañante_zona',
      ].includes(user.type) ? (
          <Item text="Coordinadores" onPress={reportCoordinadores} />
        ) : null}
      {[
        'admin',
        'integrante_chm',
        'capacitacion',
        'acompañante_decanato',
        'acompañante_zona',
      ].includes(user.type) ? (
          <Item text="Decanatos" onPress={reportDecanatos} />
        ) : null}

      {['admin', 'integrante_chm', 'capacitacion'].includes(user.type) ? (
        <Item text="Zonas" onPress={reportZonas} />
      ) : null}
      <Item text="Eventos" onPress={reportEventos} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
    paddingLeft: 15,
    marginTop: 40,
  },
});
