export function addCytoscapeClass(
  existingClasses: string | undefined,
  classToAdd: string
) {
  const existingClassesString = existingClasses ?? '';

  const existingClassesArray = classStringToClassArray(existingClassesString);

  return existingClassesArray.includes(classToAdd)
    ? existingClasses
    : classArrayToClassString([...existingClassesArray, classToAdd]);
}

export function addCytoscapeClasses(
  existingClasses: string | undefined,
  classesToAdd: string[]
) {
  return classesToAdd.reduce(addCytoscapeClass, existingClasses);
}

export function removeCytoscapeClass(
  existingClasses: string | undefined,
  classToRemove: string
) {
  const existingClassesString = existingClasses ?? '';

  const existingClassesArray = classStringToClassArray(existingClassesString);

  return !existingClassesArray.includes(classToRemove)
    ? existingClasses
    : classArrayToClassString(
        existingClassesArray.filter(
          (existingClass) => existingClass !== classToRemove
        )
      );
}

export function removeCytoscapeClasses(
  existingClasses: string | undefined,
  classesToRemove: string[]
) {
  return classesToRemove.reduce(removeCytoscapeClass, existingClasses);
}

export function addAndRemoveCytoscapeClasses(
  existingClasses: string | undefined,
  classesToAdd: string[],
  classesToRemove: string[]
) {
  return removeCytoscapeClasses(
    addCytoscapeClasses(existingClasses, classesToAdd),
    classesToRemove
  );
}

const classStringToClassArray = (classString: string) =>
  classString.trim().split(/\s+/g);

const classArrayToClassString = (classes: string[]) => classes.join(' ');
