import pandas as pd
 
# Note that "date" is a pandas keyword so not wise to use for column names
df = pd.read_csv('./fraudTrain.csv', dtype={'cc_num': 'str'}, parse_dates=[1])  # assumes transaction_date column is the 1st column (0-based)

# choose start/end dates as filters (here is 1 year worth of data)
start = pd.to_datetime("2020-01-01")
end = pd.to_datetime("2020-12-31")
# then filter out anything not inside the specified date ranges:
df = df[(start <= df.trans_date_trans_time) & (df.trans_date_trans_time <= end)]

# use only CARD_BIN from the credit card information
df['cc_num'] = df['cc_num'].str[:5]
# replace 0 with legit and 1 with fraud for our labels.
df['is_fraud'] = df['is_fraud'].replace({0:'legit', 1:'fraud'})

# rename columns to match mandatory field name for AWS service
df = df.rename(columns={"trans_date_trans_time": "EVENT_TIMESTAMP", "is_fraud": "EVENT_LABEL"})

# trick to remove a pandas column (it always add to the resulting file
df.drop('Unnamed: 0', axis=1, inplace=True)

df.to_csv('./fraudTrain_2020.csv')