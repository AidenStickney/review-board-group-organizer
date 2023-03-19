export interface Person {
  id: number;
  name: string;
  commercialSuccess: number;
  residentialSuccess: number;
  notCompatible: number[];
  cannotBeChairman: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}

function removeFromArray<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}


export function createGroups(
  people: Person[],
  peoplePerGroup: number,
  residentialGroupsCount: number,
  commercialGroupsCount: number,
): Array<{ type: string; chairman: Person; members: Person[] }> {
  const sortedCommercial = [...people].sort((a, b) => b.commercialSuccess - a.commercialSuccess);
  const sortedResidential = [...people].sort((a, b) => b.residentialSuccess - a.residentialSuccess);
  console.log(sortedCommercial);
  console.log(sortedResidential);

  const groups: Array<{ type: string; chairman: Person; members: Person[] }> = [];

  function createGroup(type: string, sortedPeople: Person[]): { type: string; chairman: Person; members: Person[] } | null {
    const groupMembers: Person[] = [];
    const topPercentage = 0.3; // You can adjust this to control the range of top performers
    const topCandidatesCount = Math.ceil(sortedPeople.length * topPercentage);

    // Find the chairman with the highest commercial or residential success
    const findChairman = (type: string, sortedPeople: Person[]): Person | null => {
      for (const person of sortedPeople) {
        if (!person.cannotBeChairman) {
          return person;
        }
      }
      return null;
    };

    const chairman = findChairman(type, sortedPeople);
    if (!chairman) {
      return null; // Return null if chairman is not found
    }

    // Remove the chairman from the sortedPeople array
    removeFromArray(sortedPeople, chairman);

    for (let j = 0; j < peoplePerGroup - 1; j++) {
      let randomIndex = Math.floor(Math.random() * topCandidatesCount);
      let person = sortedPeople[randomIndex];

      // Check if the person is compatible with the chairman and the current group members
      while (person && (groupMembers.some(member => member.notCompatible.includes(person.id)) || chairman.notCompatible.includes(person.id))) {
        randomIndex = Math.floor(Math.random() * topCandidatesCount);
        person = sortedPeople[randomIndex];
      }

      if (!person) break;

      // Remove the person from the sortedPeople array
      sortedPeople.splice(randomIndex, 1);
      groupMembers.push(person);
    }

    if (groupMembers.length === 0) {
      return null;
    }

    return { type, chairman, members: groupMembers };
  }



  let isCommercialGroup = true;
  let commercialGroupsCreated = 0;
  let residentialGroupsCreated = 0;

  while (commercialGroupsCreated < commercialGroupsCount || residentialGroupsCreated < residentialGroupsCount) {
    let group;

    if (isCommercialGroup && commercialGroupsCreated < commercialGroupsCount) {
      group = createGroup('Commercial', sortedCommercial);
      if (group) {
        groups.push(group);
        removeFromArray(sortedResidential, group.chairman);
        group.members.forEach((member) => removeFromArray(sortedResidential, member));
        commercialGroupsCreated++;
      }
    } else if (!isCommercialGroup && residentialGroupsCreated < residentialGroupsCount) {
      group = createGroup('Residential', sortedResidential);
      if (group) {
        groups.push(group);
        removeFromArray(sortedCommercial, group.chairman);
        group.members.forEach((member) => removeFromArray(sortedCommercial, member));
        residentialGroupsCreated++;
      }
    }

    // Alternate between commercial and residential groups
    isCommercialGroup = !isCommercialGroup;
  }

  // Handle leftover people by creating additional residential groups
  while (sortedResidential.length > 0) {
    const group = createGroup('Residential', sortedResidential);
    if (group) {
      groups.push(group);
    }
  }

  return groups;
}
