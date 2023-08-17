import { shuffle } from 'lodash';

export interface Person {
  id: number;
  name: string;
  commercialSuccess: number;
  residentialSuccess: number;
  notCompatible: number[];
  assignAsChairman: boolean;
  landExpertise: number;
  BPPE: number;
  type: string;
  doNotAssign: boolean;
}

export interface Panel {
  roomNumber: number;
  type: string;
  chairman: Person | null;
  members: Person[];
}

export function assignMembersToPanels(members: Person[], panels: Panel[], peoplePerGroup: number): [Panel[], Person[]] {
    let availableMembers = members.filter(member => !member.doNotAssign && member.type !== 'CS');
    let unAvailableMembers = members.filter(member => member.doNotAssign || member.type === 'CS');
    // Count the frequency of each panel type
    const panelTypeFrequency: { [key: string]: number } = {};
    for (let panel of panels) {
        if (panelTypeFrequency[panel.type]) {
            panelTypeFrequency[panel.type]++;
        } else {
            panelTypeFrequency[panel.type] = 1;
        }
    }

    // Sort panels based on the frequency of their type
    panels.sort((a, b) => panelTypeFrequency[a.type] - panelTypeFrequency[b.type]);

    for (let panel of panels) {
        availableMembers = shuffle(availableMembers);

        // Sort members based on the expertise relevant to the current panel type
        availableMembers.sort((a, b) => {
            switch(panel.type) {
                case 'C': return b.commercialSuccess - a.commercialSuccess;
                case 'L': return b.landExpertise - a.landExpertise;
                case 'R': return b.residentialSuccess - a.residentialSuccess;
                case 'BPP': return b.BPPE - a.BPPE;
                default: return 0;
            }
        });

        // Assign chairman to the panel
        let chairman = availableMembers.find(member => member.assignAsChairman);
        if (chairman) {
            panel.chairman = chairman;
            availableMembers = availableMembers.filter(member => member.id !== chairman?.id);
        } else {
            panel.chairman = null;
        }

        panel.members.push(...panel.chairman ? [panel.chairman] : [])

        // Assign members to the panel
        let panelMembersCount = panel.chairman ? 1 : 0; // If chairman exists, count as 1
        while (panelMembersCount < peoplePerGroup && availableMembers.length > 0) {
            let member = availableMembers.shift();
            if (!panel.members.some(m => member!.notCompatible.includes(m.id)) && (!panel.chairman || !member!.notCompatible.includes(panel.chairman.id))) {
                panel.members.push(member!);
                panelMembersCount++;
            } else {
                availableMembers.push(member!); // Push the member back to the list if they are not compatible
            }
        }
    }

    return [panels, availableMembers.concat(unAvailableMembers)];
}

export function getGroupTypeLabel(type: string): string {
    switch(type) {
        case 'C':
            return "Commercial";
        case 'L':
            return "Land";
        case 'R':
            return "Residential";
        case 'BPP':
            return "BPP";
        default:
            return "";
    }
}

