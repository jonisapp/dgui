import React, {useEffect} from 'react';

import * as dgui from '../dgui.ts';

const Form = ({ title, fields, footer, onSubmit, showForm, style }) => {
  style = typeof style !== 'undefined' ? style : {};
  
  const dgui_form = React.createRef();

  useEffect(() => {
    if(showForm) {
      renderForm();
    }
  }, [showForm]);

  const renderForm = () => {
    dgui.form(dgui_form.current, {
      title,
      fields,
      footer,
    }, onSubmit);
  }

  return (
    <React.Fragment>
      {
        showForm &&
        <div style={style}>
          <div ref={dgui_form} />
        </div>
      }
    </React.Fragment>
  );
};

export default Form;