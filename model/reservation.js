
// TODO les dates arrivent en string et sont converties en timestamp ici
//  dateTimeReserved --> format YYYY-MM-DD HH24:MI
//  newDateTime --> format YYYY-MM-DD HH24:MI
//  arrivingTime --> format HH24:MI
//  exitTime --> format HH24:MI

// Android
module.exports.getClientReservations = async (client, idPerson) => {
    const text = `SELECT person_id AS personId, date_time_reserved AS dateTimeReserved, arriving_time AS arrivingTime, exit_time AS exitTime, customers_nbr AS customersNbr, additional_info AS additionalInfo, is_cancelled AS isCancelled, table_id AS tableId, establishment_id AS establishmentId FROM reservation WHERE person_id = $1`;
    return await client.query(text, [idPerson]);
}

// React
module.exports.getDayReservations = async (client, dateTimeReserved, establishmentId) => {
    return await client.query(`
        SELECT person_id AS "personId", date_time_reserved AS "dateTimeReserved", arriving_time AS "arrivingTime",
               exit_time AS "exitTime", customers_nbr AS "customersNbr", additional_info AS "additionalInfo",
               is_cancelled AS "isCancelled", table_id AS "tableId", username, last_name as "lastName",
               first_name as "firstName", phone_number as "phoneNumber", email, t.is_outside as "isOutside"
        FROM reservation JOIN person p on p.id = reservation.person_id JOIN "table" t ON t.id = reservation.table_id AND t.establishment_id = reservation.establishment_id
        WHERE reservation.establishment_id = $1 AND
              date_time_reserved BETWEEN to_timestamp($2, 'YYYY-MM-DD HH24:MI:SS') AND to_timestamp($3, 'YYYY-MM-DD HH24:MI:SS')`,
        [establishmentId, dateTimeReserved + " 00:00:00", dateTimeReserved + " 23:59:59"]);
}

module.exports.addReservation = async (client, idPerson, dateTimeReserved, nbCustomers, idTable, idEstablishment) => {
    const text = `INSERT INTO reservation (person_id, date_time_reserved, customers_nbr, table_id, establishment_id) VALUES ($1, to_timestamp($2, 'YYYY-MM-DD HH24:MI'), $3, $4, $5)`;
    const values = [idPerson, dateTimeReserved, nbCustomers, idTable, idEstablishment];
    return await client.query(text, values);
}

module.exports.updateAdditionalInformations = async (client, idPerson, dateTimeReserved, additionnalInformation) => {
    const text = `UPDATE reservation SET additional_info = $1 WHERE person_id = $2 AND date_time_reserved = $3::timestamp`;
    const values = [additionnalInformation, idPerson, dateTimeReserved];
    return await client.query(text, values);
}

module.exports.updateArrivingTime = async (client, idPerson, dateTimeReserved, arrivingTime) => {
    const text = `UPDATE reservation SET arriving_time = to_timestamp($1, 'HH24:MI'), is_cancelled = $2 WHERE person_id = $3 AND date_time_reserved = $4::timestamp`;
    const values = [arrivingTime, false, idPerson, dateTimeReserved];
    return await client.query(text, values);
}

module.exports.updateExitTime = async (client, idPerson, dateTimeReserved, exitTime) => {
    const text = `UPDATE reservation SET exit_time = to_timestamp($1, 'HH24:MI') WHERE person_id = $2 AND date_time_reserved = $3::timestamp`;
    const values = [exitTime, idPerson, dateTimeReserved];
    return await client.query(text, values);
}

module.exports.cancelReservation = async (client, idPerson, dateTimeReserved) => {
    const text = `UPDATE reservation SET is_cancelled = true WHERE person_id = $1 AND date_time_reserved = $2::timestamp`;
    const values = [idPerson, dateTimeReserved];
    return await client.query(text, values);
}