exports.generateId = function(data) {
  const id = data.length ? Math.max(...data.map(datum => datum.id)) : 0;
  return id + 1;
}

exports.includes = function(persons, newPerson) {
  const names = persons.map(p => p.name.toLowerCase());
  const newName = newPerson.name.toLowerCase();
  return names.includes(newName);
}
