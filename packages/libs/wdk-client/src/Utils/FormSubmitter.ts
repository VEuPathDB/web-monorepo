type Conf = {
  method?: string;
  target?: string;
  action?: string;
  inputs?: {[key:string]: string};
};

export function submitAsForm(conf: Conf) {

  // allow missing or null config
  if (conf == undefined || conf == null) conf = {};

  // get supported values from conf
  let method = conf.method || 'post';
  let target = conf.target || '_self';
  let action = (conf.action == "" ? undefined : conf.action);
  let inputs = conf.inputs || {};

  // build the form
  let form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("target", target);
  if (action !== undefined) {
    form.setAttribute("action", action);
  }

  // add input values
  Object.keys(inputs).forEach(function(name) {
    let input = document.createElement("input");
    input.setAttribute("name", name);
    input.setAttribute("value", inputs[name]);
    form.appendChild(input);
  });

  // append form to DOM and hide it
  document.body.appendChild(form);
  form.style.display = 'none';

  // submit the form
  form.submit();

  // remove form from the DOM
  document.body.removeChild(form);
}
