import { Alarm } from '.prisma/client';
import { Button, Fieldset, useToasts } from '@geist-ui/react';
import React from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';
import swal from 'sweetalert';
import { Period } from '../../../../../server/consts';
import { client } from '../../../api/trpc';

export interface Props {
  alarm: Alarm
  onEdit: (alarm: Alarm) => void
  onDeleted: (alarm: Alarm) => void
}
function AlarmItem({alarm, onEdit, onDeleted}: Props) {
  const [toasts, setToast] = useToasts()
  return (
    <Fieldset>
    <Fieldset.Title>{alarm.name}</Fieldset.Title>
    <Fieldset.Subtitle>
      <b>symbols:</b> {alarm.symbols.join(', ')}
      <br />
      <b>period: </b> {alarm.periods.map((p) => Period[p]).join(', ')}
    </Fieldset.Subtitle>
    <Fieldset.Footer>
      <Fieldset.Footer.Actions>
        <Button
          auto
          type="success"
          size="small"
          icon={<FaEdit />}
          style={{marginRight: 15}}
          onClick={(e) => {
            // setAlarm(alarm)
            // setPage('alarmbuilder')
            onEdit(alarm)
          }}
        />
        <Button
          auto
          type="error"
          size="small"
          onClick={(e) => {
            swal({
              title: 'Are you sure to remote this alarm?',
              buttons: ['No', 'Delete'],
            }).then((r) => {
              if (r) {
                client
                  .mutation('alarm.delete', alarm.id)
                  .then((r) => {
                    // alarms.refetch()
                    onDeleted(alarm)
                    setToast({
                      type: 'success',
                      text: 'Alarm removed!',
                    })
                  })
                  .catch((e) => {
                    console.error(e)
                    setToast({
                      type: 'error',
                      text: e.message,
                    })
                  })
              }
            })
          }}
          icon={<FaTimes />}
        />
      </Fieldset.Footer.Actions>
    </Fieldset.Footer>
  </Fieldset>
  );
}

export default AlarmItem;
