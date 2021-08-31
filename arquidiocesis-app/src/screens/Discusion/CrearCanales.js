import React, { useState } from 'react';
import { Button, Input } from '../../components';
import Title from '../../components/Title';

export default (props) => {
  const [name, setName] = useState('');

  return (
    <>
      <Title text="Crear canal" />
      <Input
        noTextOver
        placeholder="Nombre del canal"
        value={name}
        onChangeText={(v) => setName(v)}
      />
      <Button
        text="Crear"
        onPress={() => {
          props.route.params.onAdd({ name });
          props.navigation.goBack();
        }}
      />
    </>
  );
};
