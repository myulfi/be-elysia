CREATE TABLE tbl_mt_json_role(
	id BIGINT PRIMARY KEY
	, mt_json_id BIGINT NOT NULL
	, mt_role_id SMALLINT NOT NULL
	, is_del SMALLINT DEFAULT(0)
	, created_by VARCHAR (20)
	, dt_created TIMESTAMP
	, updated_by VARCHAR (20)
	, dt_updated TIMESTAMP
	, version SMALLINT DEFAULT(0)
);

INSERT INTO tbl_mt_json_role VALUES (1722808854994519, 1722808414267511, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808855834419, 1722808415179617, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808855087519, 1722808415987417, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808855802218, 1722808416485611, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808856590814, 1722808416202418, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808856605716, 1722808417246417, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808856644717, 1722808417595613, 1, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808865387913, 1722808415987417, 2, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808865401913, 1722808415371517, 2, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808866290618, 1722808416202418, 2, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808866157612, 1722808416255311, 2, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808867099217, 1722808417246417, 2, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json_role VALUES (1722808867488515, 1722808417595613, 2, 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);