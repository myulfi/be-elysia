CREATE TABLE tbl_mt_branch(
	id SMALLINT PRIMARY KEY
	, nm VARCHAR (20) NOT NULL
	, addr VARCHAR (100)
	, lat DOUBLE PRECISION
	, long DOUBLE PRECISION
	, radius SMALLINT
	, mt_attend_id SMALLINT
	, qr_attend_in VARCHAR (6)
	, qr_attend_out VARCHAR (6)
	, is_del SMALLINT DEFAULT(0)
	, created_by VARCHAR (20)
	, dt_created TIMESTAMP
	, updated_by VARCHAR (20)
	, dt_updated TIMESTAMP
	, version SMALLINT DEFAULT(0)
);

INSERT INTO tbl_mt_branch VALUES(1, 'HO', 'Jalan Pulau Intan', -6.428132855073892, 106.71272040609797, 100, 1, 'ABCDEF', 'ABCDEF', 0, 'system', CURRENT_DATE, 'system', CURRENT_DATE, 0);
INSERT INTO tbl_mt_branch VALUES(2, 'Kemang', 'Jalan Kemang', -6.27232642118957, 106.82046213382861, 100, 1, 'ABCDEF', 'ABCDEF', 0, 'system', CURRENT_DATE, 'system', CURRENT_DATE, 0);